import "server-only"

import { unstable_cache } from "next/cache"

import {
  buildTokscaleInsights,
  extractTokscaleInitialData,
  type TokscaleInsights,
} from "./tokscale-parser"

export const TOKSCALE_PROFILE_URL = "https://tokscale.ai/u/Yugesh-reddy"

const getCachedTokscaleInsights = unstable_cache(
  async (): Promise<TokscaleInsights> => {
    const response = await fetch(TOKSCALE_PROFILE_URL, {
      headers: { "User-Agent": "yugesh-portfolio" },
      signal: AbortSignal.timeout(8_000),
    })

    if (!response.ok) {
      throw new Error(`Tokscale responded with ${response.status}`)
    }

    const rawData = extractTokscaleInitialData(await response.text())
    if (!rawData) {
      throw new Error("Tokscale returned an unsupported payload")
    }

    return buildTokscaleInsights(rawData)
  },
  ["yugesh-tokscale-insights"],
  { revalidate: 86_400 }
)

export async function getTokscaleInsights(): Promise<TokscaleInsights | null> {
  try {
    return await getCachedTokscaleInsights()
  } catch {
    return null
  }
}
