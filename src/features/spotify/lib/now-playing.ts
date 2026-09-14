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

export async function getNowPlaying(
  credentials: Credentials,
  fetcher: typeof fetch = fetch
): Promise<NowPlaying> {
  const { clientId, clientSecret, refreshToken } = credentials
  if (!clientId || !clientSecret || !refreshToken)
    return { status: "unconfigured" }
  try {
    const tokenResponse = await fetcher(
      "https://accounts.spotify.com/api/token",
      {
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
      }
    )
    if (!tokenResponse.ok) return { status: "unavailable" }
    const token = z
      .object({ access_token: z.string().min(1) })
      .parse(await tokenResponse.json())
    const accessToken = token.access_token
    const response = await fetcher(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      }
    )
    if (response.status === 204) return getLastPlayed(fetcher, accessToken)
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
      return remember({
        status: "playing",
        ...fieldsOf(track),
        ...(playback.progress_ms != null && track.duration_ms
          ? { progressMs: Math.min(playback.progress_ms, track.duration_ms) }
          : {}),
      })
    }
    if (!playback.is_playing && !isPrivate && isTrack) {
      // Paused mid-track: Spotify only writes history once a track finishes
      // or is skipped, so this may never appear in recently-played — yet it
      // is unambiguously what was last played.
      const parsed = trackSchema.safeParse(playback.item)
      if (parsed.success) {
        const fields = fieldsOf(parsed.data)
        remember({ status: "playing", ...fields })
        return { status: "recent", ...fields }
      }
    }
    return getLastPlayed(fetcher, accessToken)
  } catch {
    return { status: "unavailable" }
  }
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
 * Last track this server instance actually saw playing. Covers quitting the
 * app mid-track: currently-playing goes silent and history never records it.
 * Private sessions are never remembered. Best effort across serverless
 * instances — cold starts fall back to history below.
 */
let lastSeen: (TrackFields & { seenAt: string }) | null = null

function remember<T extends TrackFields & { status: "playing" }>(track: T): T {
  lastSeen = {
    title: track.title,
    artist: track.artist,
    url: track.url,
    artwork: track.artwork,
    ...(track.album ? { album: track.album } : {}),
    ...(track.durationMs ? { durationMs: track.durationMs } : {}),
    seenAt: new Date().toISOString(),
  }
  return track
}

const recentSchema = z.object({
  items: z.array(
    z.object({
      track: trackSchema,
      played_at: z.string().datetime({ offset: true }),
    })
  ),
})

/** Last played track for the idle tile. Never throws: failures stay idle. */
async function getLastPlayed(
  fetcher: typeof fetch,
  accessToken: string
): Promise<NowPlaying> {
  let history: z.infer<typeof recentSchema>["items"][number] | undefined
  try {
    const response = await fetcher(
      "https://api.spotify.com/v1/me/player/recently-played?limit=1",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      }
    )
    history = response.ok
      ? recentSchema.parse(await response.json()).items.at(0)
      : undefined
  } catch {
    history = undefined
  }
  if (lastSeen && (!history || lastSeen.seenAt >= history.played_at)) {
    // The server saw this track playing after anything in history — e.g.
    // the app was quit mid-track before Spotify recorded it.
    const { seenAt, ...track } = lastSeen
    return { status: "recent", ...track, playedAt: seenAt }
  }
  if (!history) return { status: "idle" }
  return {
    status: "recent",
    ...fieldsOf(history.track),
    playedAt: history.played_at,
  }
}

/** Test-only reset for the in-memory last-seen track. */
export function __resetSpotifyMemory() {
  lastSeen = null
}
