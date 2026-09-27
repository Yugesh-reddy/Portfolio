import { createRedisCommand } from "@/lib/upstash"

import type { SpotifyStore } from "./now-playing"

const KEY = "portfolio:spotify:memory"

/** Shares the last track and Spotify's back-off across instances. */
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
  }
}
