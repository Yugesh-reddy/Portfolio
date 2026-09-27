import { z } from "zod"

export type NowPlaying =
  | { status: "unconfigured" | "idle" | "unavailable" }
  | (TrackFields & {
      status: "playing"
      progressMs?: number
    })
  | (TrackFields & {
      status: "recent"
      playedAt?: string
    })

type Credentials = {
  clientId?: string
  clientSecret?: string
  refreshToken?: string
}

const trackSchema = z.object({
  name: z.string().min(1),
  duration_ms: z.number().int().positive().optional(),
  artists: z.array(z.object({ name: z.string().min(1) })).min(1),
  external_urls: z.object({
    spotify: z
      .string()
      .url()
      .refine((url) => new URL(url).origin === "https://open.spotify.com"),
  }),
  album: z.object({
    name: z.string().optional(),
    images: z.array(
      z.object({
        width: z.number().positive().nullish(),
        url: z
          .string()
          .url()
          .refine((url) => new URL(url).origin === "https://i.scdn.co"),
      })
    ),
  }),
})

/** How often to ask Spotify's history, which has its own small quota. */
const HISTORY_INTERVAL = 10 * 60_000
/** How often a track still playing refreshes its remembered time. */
const SEEN_INTERVAL = 2 * 60_000

const memorySchema = z.object({
  /** Last public track seen playing or found in history. */
  last: z
    .object({
      title: z.string().min(1),
      artist: z.string().min(1),
      url: z
        .string()
        .url()
        .refine((url) => new URL(url).origin === "https://open.spotify.com"),
      artwork: z
        .string()
        .url()
        .refine((url) => new URL(url).origin === "https://i.scdn.co")
        .optional(),
      album: z.string().optional(),
      durationMs: z.number().int().positive().optional(),
      playedAt: z.string().datetime({ offset: true }),
    })
    .optional(),
  /** When history was last asked. */
  historyAt: z.number().optional(),
  /** Retry-After deadlines from Spotify, per endpoint. */
  retryAt: z
    .object({ playing: z.number().optional(), history: z.number().optional() })
    .optional(),
})
export type SpotifyMemory = z.infer<typeof memorySchema>

/** Where the memory lives: Redis in production, shared by every instance. */
export type SpotifyStore = {
  read: () => Promise<unknown>
  write: (memory: SpotifyMemory) => Promise<unknown>
}

let local: unknown = null
const instanceStore: SpotifyStore = {
  read: async () => local,
  write: async (memory) => {
    local = memory
  },
}

export async function getNowPlaying(
  credentials: Credentials,
  fetcher: typeof fetch = fetch,
  {
    store = instanceStore,
    now = Date.now,
  }: { store?: SpotifyStore; now?: () => number } = {}
): Promise<NowPlaying> {
  const { clientId, clientSecret, refreshToken } = credentials
  if (!clientId || !clientSecret || !refreshToken)
    return { status: "unconfigured" }
  const memory: SpotifyMemory =
    memorySchema.safeParse(await store.read().catch(() => null)).data ?? {}
  const before = JSON.stringify(memory)
  const result = await poll(
    { clientId, clientSecret, refreshToken },
    fetcher,
    memory,
    now()
  )
  if (JSON.stringify(memory) !== before)
    await store.write(memory).catch(() => undefined)
  return result
}

async function poll(
  credentials: Required<Credentials>,
  fetcher: typeof fetch,
  memory: SpotifyMemory,
  time: number
): Promise<NowPlaying> {
  if (time < (memory.retryAt?.playing ?? 0)) return remembered(memory)
  try {
    const accessToken = await getAccessToken(credentials, fetcher, time)
    if (!accessToken) return { status: "unavailable" }
    const response = await fetcher(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      }
    )
    if (response.status === 429) {
      backOff(memory, "playing", response, time)
      return remembered(memory)
    }
    if (response.status === 401) access = null
    if (response.status === 204)
      return getLastPlayed(fetcher, accessToken, memory, time)
    if (!response.ok) return { status: "unavailable" }
    const playback = z
      .object({
        is_playing: z.boolean(),
        progress_ms: z.number().int().nonnegative().nullish(),
        currently_playing_type: z.string(),
        item: z.unknown(),
        device: z
          .object({ is_private_session: z.boolean().optional() })
          .nullish(),
      })
      .parse(await response.json())
    const isPrivate = playback.device?.is_private_session === true
    const isTrack = playback.currently_playing_type === "track"
    if (playback.is_playing && !isPrivate && isTrack) {
      // Strict: a malformed live track is a contract breach, not a fallback.
      const track = trackSchema.parse(playback.item)
      const fields = fieldsOf(track)
      remember(memory, fields, time)
      return {
        status: "playing",
        ...fields,
        ...(playback.progress_ms != null && track.duration_ms
          ? { progressMs: Math.min(playback.progress_ms, track.duration_ms) }
          : {}),
      }
    }
    if (!playback.is_playing && !isPrivate && isTrack) {
      // Paused mid-track: Spotify only writes history once a track finishes
      // or is skipped, so this may never appear in recently-played — yet it
      // is unambiguously what was last played.
      const parsed = trackSchema.safeParse(playback.item)
      if (parsed.success) {
        const fields = fieldsOf(parsed.data)
        remember(memory, fields, time)
        return { status: "recent", ...fields }
      }
    }
    return getLastPlayed(fetcher, accessToken, memory, time)
  } catch {
    return { status: "unavailable" }
  }
}

/** Access tokens last an hour, so refresh one only when it runs out. */
let access: { refreshToken: string; token: string; expiresAt: number } | null =
  null

async function getAccessToken(
  { clientId, clientSecret, refreshToken }: Required<Credentials>,
  fetcher: typeof fetch,
  time: number
) {
  if (access?.refreshToken === refreshToken && time < access.expiresAt)
    return access.token
  const response = await fetcher("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  })
  if (!response.ok) return null
  const token = z
    .object({
      access_token: z.string().min(1),
      expires_in: z.number().positive().optional(),
    })
    .parse(await response.json())
  access = {
    refreshToken,
    token: token.access_token,
    // A minute early, so a token never expires between check and use.
    expiresAt: time + ((token.expires_in ?? 3600) - 60) * 1000,
  }
  return token.access_token
}

/** Spotify's 429 says how long to wait; a used-up quota can mean half an hour. */
function backOff(
  memory: SpotifyMemory,
  endpoint: "playing" | "history",
  response: Response,
  time: number
) {
  const seconds = Number(response.headers.get("Retry-After")) || 60
  memory.retryAt = {
    ...memory.retryAt,
    [endpoint]: time + Math.min(seconds, 86_400) * 1000,
  }
}

/** The last known track, so quota errors never blank the tile. */
function remembered(memory: SpotifyMemory): NowPlaying {
  return memory.last ? { status: "recent", ...memory.last } : { status: "idle" }
}

type Track = z.infer<typeof trackSchema>
type TrackFields = {
  title: string
  artist: string
  url: string
  artwork?: string
  album?: string
  durationMs?: number
}

function fieldsOf(track: Track): TrackFields {
  // Enough detail for the larger cover, without loading the largest image.
  const artwork =
    [...track.album.images]
      .filter((image) => image.width && image.width >= 256)
      .sort((a, b) => a.width! - b.width!)
      .at(0) || track.album.images.at(0)
  return {
    title: track.name,
    artist: track.artists.map(({ name }) => name).join(", "),
    url: track.external_urls.spotify,
    artwork: artwork?.url,
    ...(track.album.name ? { album: track.album.name } : {}),
    ...(track.duration_ms ? { durationMs: track.duration_ms } : {}),
  }
}

/**
 * Remember a public track seen on the player. Covers quitting the app
 * mid-track: currently-playing goes silent and history never records it.
 * Private sessions never get here.
 */
function remember(memory: SpotifyMemory, track: TrackFields, time: number) {
  const last = memory.last
  if (
    last?.url === track.url &&
    time - Date.parse(last.playedAt) < SEEN_INTERVAL
  )
    return
  memory.last = { ...track, playedAt: new Date(time).toISOString() }
}

const recentSchema = z.object({
  items: z.array(
    z.object({
      track: trackSchema,
      played_at: z.string().datetime({ offset: true }),
    })
  ),
})

/** Last played track for the idle tile. Never throws: failures keep memory. */
async function getLastPlayed(
  fetcher: typeof fetch,
  accessToken: string,
  memory: SpotifyMemory,
  time: number
): Promise<NowPlaying> {
  if (
    time - (memory.historyAt ?? 0) < HISTORY_INTERVAL ||
    time < (memory.retryAt?.history ?? 0)
  )
    return remembered(memory)
  try {
    const response = await fetcher(
      "https://api.spotify.com/v1/me/player/recently-played?limit=1",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      }
    )
    if (response.status === 429) {
      backOff(memory, "history", response, time)
      return remembered(memory)
    }
    memory.historyAt = time
    const history = response.ok
      ? recentSchema.parse(await response.json()).items.at(0)
      : undefined
    // A track the server saw playing after anything in history wins, e.g.
    // the app was quit mid-track before Spotify recorded it.
    if (
      history &&
      (!memory.last ||
        Date.parse(history.played_at) > Date.parse(memory.last.playedAt))
    )
      memory.last = { ...fieldsOf(history.track), playedAt: history.played_at }
  } catch {
    memory.historyAt = time
  }
  return remembered(memory)
}

/** Test-only reset for this instance's memory and access token. */
export function __resetSpotifyMemory() {
  local = null
  access = null
}
