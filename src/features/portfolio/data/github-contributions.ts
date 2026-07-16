import "server-only"

import { unstable_cache } from "next/cache"

import { GITHUB_USERNAME } from "@/config/site"
import type { Activity } from "@/registry/components/contribution-graph"

type GitHubContributionsResponse = {
  contributions: Activity[]
}

export const getGitHubContributions = unstable_cache(
  async (): Promise<Activity[]> => {
    const apiUrl = process.env.GITHUB_CONTRIBUTIONS_API_URL
    if (!apiUrl) return []
    try {
      const res = await fetch(`${apiUrl}/v4/${GITHUB_USERNAME}?y=last`)
      if (!res.ok) return []
      const data = (await res.json()) as GitHubContributionsResponse
      return data.contributions ?? []
    } catch {
      return []
    }
  },
  ["github-contributions", GITHUB_USERNAME],
  { revalidate: 86400 } // Cache for 1 day (86400 seconds)
)
