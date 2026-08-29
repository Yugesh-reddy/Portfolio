import { Suspense } from "react"

import { getGitHubContributions } from "@/features/portfolio/data/github-contributions"

import { HandwrittenArrow, HandwrittenNote } from "../handwritten-note"
import { Panel } from "../panel"
import { GitHubContributionFallback, GitHubContributionGraph } from "./graph"

export function GitHubContributions() {
  const contributions = getGitHubContributions()

  return (
    <Panel className="before:content-none">
      <h2 className="sr-only">GitHub Contributions</h2>

      <Suspense fallback={<GitHubContributionFallback />}>
        <GitHubContributionGraph contributions={contributions} />
      </Suspense>

      <HandwrittenNote
        className="top-8 left-full ml-2 hidden w-24 flex-col items-start lg:flex"
        aria-hidden
      >
        <span className="rotate-3">busy year</span>
        <HandwrittenArrow className="mt-1 size-7 rotate-3" />
      </HandwrittenNote>

      <div className="flex h-px" />
    </Panel>
  )
}
