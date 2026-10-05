import { createActivityHandlers } from "@/features/activity/lib/activity"
import { createActivityStore } from "@/features/activity/lib/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const INSTANCE_CACHE_TTL_MS = 10_000

let cachedBody: string | undefined
let cachedStatus = 200
let cachedControl = "no-store"
let expiresAt = 0
let pendingRead: Promise<Response> | undefined

function handlers() {
  const store = createActivityStore()
  return createActivityHandlers({
    token: process.env.ACTIVITY_SYNC_TOKEN,
    ...store,
  })
}

export async function GET() {
  if (cachedBody !== undefined && Date.now() < expiresAt) {
    return new Response(cachedBody, {
      status: cachedStatus,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": cachedControl,
      },
    })
  }

  pendingRead ??= handlers().GET()
  try {
    const response = await pendingRead
    const body = await response.text()
    const cacheControl = response.headers.get("Cache-Control") || "no-store"
    if (response.ok) {
      cachedBody = body
      cachedStatus = response.status
      cachedControl = cacheControl
      expiresAt = Date.now() + INSTANCE_CACHE_TTL_MS
    }
    return new Response(body, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": cacheControl,
      },
    })
  } finally {
    pendingRead = undefined
  }
}

export async function POST(request: Request) {
  const response = await handlers().POST(request)
  if (response.ok) {
    cachedBody = undefined
    expiresAt = 0
  }
  return response
}
