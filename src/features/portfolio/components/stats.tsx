import { Suspense } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { TokensSection } from "@/features/stats/components/tokens-section"

import { HandwrittenArrow, HandwrittenNote } from "./handwritten-note"
import { Panel, PanelHeader, PanelTitle } from "./panel"

function StatsFallback() {
  return (
    <div className="space-y-4 p-4 motion-reduce:[&_[data-slot=skeleton]]:animate-none">
      <Skeleton className="h-12 w-full" />
      <div className="grid grid-cols-2 gap-px sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton className="h-24" key={index} />
        ))}
      </div>
      <Skeleton className="aspect-2/1 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  )
}

export function Stats() {
  return (
    <Panel id="stats" aria-labelledby="stats-title">
      <PanelHeader>
        <PanelTitle id="stats-title">Stats</PanelTitle>
      </PanelHeader>

      <HandwrittenNote
        className="top-6 left-full ml-2 hidden w-32 flex-col items-start lg:flex"
        aria-hidden
      >
        <span className="rotate-3">building with AI, measured</span>
        <HandwrittenArrow className="mt-1 size-7 rotate-3" />
      </HandwrittenNote>

      <Suspense fallback={<StatsFallback />}>
        <TokensSection embedded />
      </Suspense>
    </Panel>
  )
}
