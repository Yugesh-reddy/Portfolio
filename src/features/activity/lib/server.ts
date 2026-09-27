import { createRedisCommand } from "@/lib/upstash"

import { snapshotSchema, type ActivitySnapshot } from "./activity"

const KEY = "portfolio:activity:latest"
// Store only percentages. ISO timestamps are normalized to UTC before comparison.
export const UPDATE_ACTIVITY_SCRIPT = `
local previous = redis.call('GET', KEYS[1])
if previous and cjson.decode(previous).updatedAt > ARGV[2] then return 0 end
redis.call('SET', KEYS[1], ARGV[1], 'EX', 604800)
return 1
`

export function createActivityStore() {
  const command = createRedisCommand()
  if (!command) return null
  return {
    async read(): Promise<ActivitySnapshot | null> {
      const result = await command(["GET", KEY])
      if (result === null) return null
      if (typeof result !== "string") throw Error("Invalid snapshot")
      return snapshotSchema.parse(JSON.parse(result))
    },
    async write(snapshot: ActivitySnapshot) {
      const result = await command([
        "EVAL",
        UPDATE_ACTIVITY_SCRIPT,
        1,
        KEY,
        JSON.stringify(snapshot),
        snapshot.updatedAt,
      ])
      if (result !== 0 && result !== 1)
        throw Error("Activity storage unavailable")
      return result === 1
    },
  }
}
