import { Suspense } from "react"
import type { Metadata } from "next"

import { SHARE_IMAGES, X_HANDLE } from "@/config/site"
import { Skeleton } from "@/components/ui/skeleton"
import {
  PageHeading,
  PageHeadingDescription,
  PageHeadingTagline,
  PageHeadingTitle,
} from "@/components/page-heading"
import { TokensSection } from "@/features/stats/components/tokens-section"

const title = "Stats"
const description = "AI coding usage, models, and costs from Tokscale."

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/stats" },
  openGraph: {
    url: "/stats",
    type: "website",
    images: [...SHARE_IMAGES],
  },
  twitter: {
    card: "summary_large_image",
    site: X_HANDLE,
    creator: X_HANDLE,
    images: [...SHARE_IMAGES],
  },
}

export default function StatsPage() {
  return (
    <div className="min-h-svh">
      <PageHeading>
        <PageHeadingTagline>Stats</PageHeadingTagline>
        <PageHeadingTitle>Building with AI, measured.</PageHeadingTitle>
        <PageHeadingDescription>
          A public view of the coding agents and models behind my work.
        </PageHeadingDescription>
      </PageHeading>

      <Suspense
        fallback={
          <div className="screen-line-top space-y-4 p-4 motion-reduce:[&_[data-slot=skeleton]]:animate-none">
            <Skeleton className="h-12 w-full" />
            <div className="grid grid-cols-2 gap-px sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton className="h-24" key={index} />
              ))}
            </div>
            <Skeleton className="aspect-2/1 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        }
      >
        <TokensSection />
      </Suspense>
    </div>
  )
}
