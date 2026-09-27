import { createActivityHandlers } from "@/features/activity/lib/activity"
import { createActivityStore } from "@/features/activity/lib/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function handlers() {
  const store = createActivityStore()
  return createActivityHandlers({
    token: process.env.ACTIVITY_SYNC_TOKEN,
    ...store,
  })
}
export async function GET() {
  return handlers().GET()
}
export async function POST(request: Request) {
  return handlers().POST(request)
}
