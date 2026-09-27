import { getNowPlaying } from "@/features/spotify/lib/now-playing"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

let cached: Awaited<ReturnType<typeof getNowPlaying>> | undefined
let expiresAt = 0
let pending: ReturnType<typeof getNowPlaying> | undefined

export async function GET() {
  if (!cached || Date.now() >= expiresAt) {
    pending ??= getNowPlaying({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      refreshToken: process.env.SPOTIFY_REFRESH_TOKEN,
    })
    cached = await pending
    expiresAt = Date.now() + 30_000
    pending = undefined
  }
  return Response.json(cached, {
    headers: { "Cache-Control": "public, max-age=0, s-maxage=30" },
  })
}
