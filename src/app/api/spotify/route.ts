import { after } from "next/server"

import { getNowPlaying } from "@/features/spotify/lib/now-playing"
import { createSpotifyStore } from "@/features/spotify/lib/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const CACHE_TTL_MS = 30_000
const ERROR_TTL_MS = 60_000

let cached: Awaited<ReturnType<typeof getNowPlaying>> | undefined
let expiresAt = 0
let pending: ReturnType<typeof getNowPlaying> | undefined

export async function GET() {
  if (!cached || Date.now() >= expiresAt) {
    if (!pending) {
      pending = getNowPlaying(
        {
          clientId: process.env.SPOTIFY_CLIENT_ID,
          clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
          refreshToken: process.env.SPOTIFY_REFRESH_TOKEN,
        },
        fetch,
        {
          store: createSpotifyStore(),
          schedule: (work) => after(work),
        }
      )
    }
    try {
      const next = await pending
      cached = next
      expiresAt =
        Date.now() +
        (next.status === "unavailable" ? ERROR_TTL_MS : CACHE_TTL_MS)
    } finally {
      pending = undefined
    }
  }
  const cacheControl =
    cached.status === "unavailable"
      ? "public, max-age=0, s-maxage=60, stale-while-revalidate=300"
      : "public, max-age=0, s-maxage=30, stale-while-revalidate=300"

  return Response.json(cached, {
    headers: { "Cache-Control": cacheControl },
  })
}
