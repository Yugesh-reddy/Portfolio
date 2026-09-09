import { randomBytes } from "node:crypto"
import { readFile, writeFile } from "node:fs/promises"
import { createServer } from "node:http"
import { loadEnvFile } from "node:process"

try {
  loadEnvFile(".env.local")
} catch {
  /* Credentials may already be in the environment. */
}
const clientId = process.env.SPOTIFY_CLIENT_ID
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
if (!clientId || !clientSecret) {
  console.error(
    "Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to .env.local first. See docs/spotify-setup.md."
  )
  process.exit(1)
}

const redirectUri = "http://127.0.0.1:4381/callback"
const state = randomBytes(32).toString("hex")
const authorization = new URL("https://accounts.spotify.com/authorize")
authorization.search = new URLSearchParams({
  client_id: clientId,
  response_type: "code",
  redirect_uri: redirectUri,
  scope: "user-read-currently-playing user-read-recently-played",
  state,
}).toString()

let exchanging = false
const server = createServer(async (request, response) => {
  response.setHeader("Content-Type", "text/plain; charset=utf-8")
  response.setHeader("Cache-Control", "no-store")
  response.setHeader("Referrer-Policy", "no-referrer")
  const url = new URL(request.url, "http://127.0.0.1:4381")
  if (url.pathname !== "/callback") {
    response.writeHead(404).end("Not found")
    return
  }
  if (url.searchParams.get("state") !== state) {
    response
      .writeHead(400)
      .end("Invalid authorization state. Restart the connection script.")
    return
  }
  const code = url.searchParams.get("code")
  if (!code || exchanging) {
    response
      .writeHead(400)
      .end("Authorization was declined or is already being completed.")
    return
  }
  exchanging = true
  try {
    const result = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
      signal: AbortSignal.timeout(10000),
    })
    if (!result.ok) throw Error("Authorization failed")
    const tokens = await result.json()
    if (typeof tokens.refresh_token !== "string" || !tokens.refresh_token)
      throw Error("Missing refresh token")
    const previous = await readFile(".env.local", "utf8").catch((error) => {
      if (error.code === "ENOENT") return ""
      throw error
    })
    const setting = `SPOTIFY_REFRESH_TOKEN=${JSON.stringify(tokens.refresh_token)}`
    const next = /^SPOTIFY_REFRESH_TOKEN=.*$/m.test(previous)
      ? previous.replace(/^SPOTIFY_REFRESH_TOKEN=.*$/m, () => setting)
      : `${previous.trimEnd()}\n${setting}\n`
    await writeFile(".env.local", next, { mode: 0o600 })
    response.end(
      "Spotify connected. You can close this tab. Restart the portfolio dev server and play a track to verify the tile."
    )
    console.log(
      "Spotify connected. Refresh token saved to .env.local; no credentials were printed."
    )
  } catch {
    response
      .writeHead(500)
      .end(
        "Could not finish connecting Spotify. Check the app credentials and redirect URI, then rerun the script."
      )
    console.error("Spotify connection failed. No token was printed.")
  } finally {
    server.close()
  }
})
server.on("error", () => {
  console.error("Could not start the local callback server on port 4381.")
  process.exitCode = 1
})
server.listen(4381, "127.0.0.1", () => {
  console.log(
    "Open this URL and approve read-only access to your currently playing track:"
  )
  console.log(authorization.href)
})
setTimeout(() => server.close(), 10 * 60 * 1000).unref()
