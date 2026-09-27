/** Upstash Redis REST commands, or null when storage is not configured. */
export function createRedisCommand() {
  // The Vercel Marketplace integration injects the KV_* names.
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  try {
    if (new URL(url).protocol !== "https:") return null
  } catch {
    return null
  }
  return async (args: (string | number)[]) => {
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
    if (!response.ok) throw Error("Redis unavailable")
    const payload = (await response.json()) as {
      result?: unknown
      error?: unknown
    }
    if (payload.error || !("result" in payload))
      throw Error("Redis unavailable")
    return payload.result
  }
}
