import assert from "node:assert/strict"
import test from "node:test"

const modulePath = new URL(
  "../src/features/spotify/lib/now-playing.ts",
  import.meta.url
)
const credentials = {
  clientId: "test-client",
  clientSecret: "secret",
  refreshToken: "refresh",
}
const track = {
  is_playing: true,
  currently_playing_type: "track",
  item: {
    type: "track",
    name: "Test song",
    artists: [{ name: "Test artist" }],
    external_urls: { spotify: "https://open.spotify.com/track/test" },
    album: { images: [{ url: "https://i.scdn.co/image/test" }] },
  },
}
const recentItem = {
  track: track.item,
  played_at: "2026-09-10T10:00:00.000Z",
}

async function query({ playback, recent }) {
  const { __resetSpotifyMemory, getNowPlaying } = await import(modulePath.href)
  __resetSpotifyMemory()
  return getNowPlaying(credentials, async (url) => {
    const target = String(url)
    if (target.includes("api/token"))
      return Response.json({ access_token: "access" })
    if (target.includes("recently-played")) return recent
    return playback
  })
}

test("missing credentials never fetch or pretend playback is idle", async () => {
  const { getNowPlaying } = await import(modulePath.href)
  assert.deepEqual(
    await getNowPlaying({}, () => {
      throw Error("must not fetch")
    }),
    { status: "unconfigured" }
  )
})

test("exposes only public track metadata while playing", async () => {
  assert.deepEqual(
    await query({
      playback: Response.json(track),
      recent: Response.json({ items: [recentItem] }),
    }),
    {
      status: "playing",
      title: "Test song",
      artist: "Test artist",
      url: "https://open.spotify.com/track/test",
      artwork: "https://i.scdn.co/image/test",
    }
  )
})

test("a paused track shows as last played even before history records it", async () => {
  const paused = {
    ...track,
    is_playing: false,
    item: {
      ...track.item,
      name: "Paused song",
      external_urls: { spotify: "https://open.spotify.com/track/paused" },
    },
  }
  const result = await query({
    playback: Response.json(paused),
    recent: Response.json({ items: [recentItem] }),
  })
  assert.equal(result.status, "recent")
  assert.equal(result.title, "Paused song")
  assert.equal(result.url, "https://open.spotify.com/track/paused")
})

test("the listening widget receives album details, larger artwork and real progress", async () => {
  const result = await query({
    playback: Response.json({
      ...track,
      progress_ms: 42_000,
      item: {
        ...track.item,
        duration_ms: 180_000,
        album: {
          name: "Test album",
          images: [
            { url: "https://i.scdn.co/image/large", width: 640 },
            { url: "https://i.scdn.co/image/medium", width: 300 },
            { url: "https://i.scdn.co/image/small", width: 64 },
          ],
        },
      },
    }),
  })
  assert.equal(result.album, "Test album")
  assert.equal(result.artwork, "https://i.scdn.co/image/medium")
  assert.equal(result.durationMs, 180_000)
  assert.equal(result.progressMs, 42_000)
})

test("missing progress is omitted, and paused tracks never claim live progress", async () => {
  for (const is_playing of [true, false]) {
    const result = await query({
      playback: Response.json({
        ...track,
        is_playing,
        progress_ms: is_playing ? null : 42_000,
        item: { ...track.item, duration_ms: 180_000 },
      }),
    })
    assert.equal(result.durationMs, 180_000)
    assert.equal("progressMs" in result, false)
  }
})

test("playback position is clamped to the actual track duration", async () => {
  const result = await query({
    playback: Response.json({
      ...track,
      progress_ms: 200_000,
      item: { ...track.item, duration_ms: 180_000 },
    }),
  })
  assert.equal(result.progressMs, 180_000)
})

test("private sessions fall back to history without remembering the track", async () => {
  const { __resetSpotifyMemory, getNowPlaying } = await import(modulePath.href)
  __resetSpotifyMemory()
  const fetcher = async (url) => {
    const target = String(url)
    if (target.includes("api/token"))
      return Response.json({ access_token: "access" })
    if (target.includes("recently-played"))
      return Response.json({ items: [recentItem] })
    return Response.json({
      ...track,
      device: { is_private_session: true },
    })
  }
  const first = await getNowPlaying(credentials, fetcher)
  assert.equal(first.status, "recent")
  assert.equal(first.title, "Test song")
  // Quitting afterwards with empty history must stay idle: the private
  // track was never remembered.
  const second = await getNowPlaying(credentials, async (url) => {
    const target = String(url)
    if (target.includes("api/token"))
      return Response.json({ access_token: "access" })
    if (target.includes("recently-played")) return Response.json({ items: [] })
    return new Response(null, { status: 204 })
  })
  assert.deepEqual(second, { status: "idle" })
})

test("a track seen playing survives quitting before history records it", async () => {
  const { __resetSpotifyMemory, getNowPlaying } = await import(modulePath.href)
  __resetSpotifyMemory()
  const seen = async (playback, recent) =>
    getNowPlaying(credentials, async (url) => {
      const target = String(url)
      if (target.includes("api/token"))
        return Response.json({ access_token: "access" })
      if (target.includes("recently-played")) return recent
      return playback
    })
  const loser = {
    ...track,
    item: {
      ...track.item,
      name: "Loser",
      external_urls: { spotify: "https://open.spotify.com/track/loser" },
    },
  }
  assert.equal((await seen(Response.json(loser), null)).status, "playing")
  // App quit: player silent, history still stale — memory wins.
  const quit = await seen(
    new Response(null, { status: 204 }),
    Response.json({
      items: [
        {
          track: track.item,
          played_at: "2020-01-01T00:00:00.000Z",
        },
      ],
    })
  )
  assert.equal(quit.status, "recent")
  assert.equal(quit.title, "Loser")
  // Newer history wins over older memory.
  const newer = await seen(
    new Response(null, { status: 204 }),
    Response.json({
      items: [
        {
          track: track.item,
          played_at: "2999-01-01T00:00:00.000Z",
        },
      ],
    })
  )
  assert.equal(newer.status, "recent")
  assert.equal(newer.title, "Test song")
})

test("empty or failing recent history stays idle without inventing a song", async () => {
  for (const recent of [
    Response.json({ items: [] }),
    new Response("denied", { status: 403 }),
    Response.json({ items: [{ track: { name: "bad" } }] }),
  ])
    assert.deepEqual(
      await query({ playback: new Response(null, { status: 204 }), recent }),
      { status: "idle" }
    )
})

test("upstream errors and malformed responses cannot leak credentials", async () => {
  const { getNowPlaying } = await import(modulePath.href)
  const playback = new Response("secret", { status: 401 })
  assert.deepEqual(
    await query({
      playback,
      recent: Response.json({ items: [recentItem] }),
    }),
    { status: "unavailable" }
  )
  assert.deepEqual(
    await query({
      playback: Response.json({ ...track, item: { name: "bad" } }),
      recent: Response.json({ items: [recentItem] }),
    }),
    { status: "unavailable" }
  )
  assert.deepEqual(
    await getNowPlaying(credentials, async () => {
      throw Error("secret")
    }),
    { status: "unavailable" }
  )
})

test("rejects unexpected external links in track metadata", async () => {
  const data = {
    ...track,
    item: { ...track.item, external_urls: { spotify: "javascript:alert(1)" } },
  }
  assert.deepEqual(
    await query({
      playback: Response.json(data),
      recent: Response.json({ items: [recentItem] }),
    }),
    { status: "unavailable" }
  )
})
