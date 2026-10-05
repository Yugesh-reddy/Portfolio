import { createRedisCommand } from "@/lib/upstash"

import type { SpotifyStore } from "./now-playing"

const KEY = "portfolio:spotify:memory"
const TOKEN_KEY = "portfolio:spotify:token"

/** Shares the last track, Spotify's back-off, and short-lived OAuth token across instances. */
export function createSpotifyStore(): SpotifyStore | undefined {
  const command = createRedisCommand()
  if (!command) return undefined
  return {
    async read() {
      const result = await command(["GET", KEY])
      return typeof result === "string" ? JSON.parse(result) : null
    },
    // Public track details and timestamps only, kept for 30 days.
    write: (memory) =>
      command(["SET", KEY, JSON.stringify(memory), "EX", 2_592_000]),
    async readToken() {
      const result = await command(["GET", TOKEN_KEY])
      return typeof result === "string" ? JSON.parse(result) : null
    },
    writeToken: (value, ttlSeconds) =>
      command([
        "SET",
        TOKEN_KEY,
        JSON.stringify(value),
        "EX",
        Math.max(60, Math.floor(ttlSeconds)),
      ]),
    clearToken: () => command(["DEL", TOKEN_KEY]),
  }
}
