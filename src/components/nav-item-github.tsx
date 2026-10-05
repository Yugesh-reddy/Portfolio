import { cache } from "react"

import { SOURCE_CODE_GITHUB_REPO } from "@/config/site"
import { GitHubStars } from "@/components/github-stars"

const getStargazerCount = cache(async () => {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${SOURCE_CODE_GITHUB_REPO}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          ...(process.env.GITHUB_API_TOKEN
            ? { Authorization: `Bearer ${process.env.GITHUB_API_TOKEN}` }
            : {}),
          "X-GitHub-Api-Version": "2026-03-10",
        },
        cache: "force-cache",
        signal: AbortSignal.timeout(4_000),
      }
    )

    if (!response.ok) {
      return 0
    }

    const json = (await response.json()) as { stargazers_count?: number }
    return Number(json?.stargazers_count) || 0
  } catch {
    return 0
  }
})

export async function NavItemGitHub() {
  const stargazersCount = await getStargazerCount()

  return (
    <GitHubStars
      repo={SOURCE_CODE_GITHUB_REPO}
      stargazersCount={stargazersCount}
    />
  )
}
