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
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  try {
    if (new URL(url).protocol !== "https:") return null
  } catch {
    return null
  }
  const command = async (args: (string | number)[]) => {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) throw Error("Activity storage unavailable")
    const payload = (await response.json()) as {
      result?: unknown
      error?: unknown
    }
    if (payload.error || !("result" in payload))
      throw Error("Activity storage unavailable")
    return payload.result
  }
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
