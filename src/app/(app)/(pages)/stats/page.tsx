import type { Metadata } from "next"

import { X_HANDLE } from "@/config/site"
import {
  PageHeading,
  PageHeadingDescription,
  PageHeadingTagline,
  PageHeadingTitle,
} from "@/components/page-heading"
import { TokensSection } from "@/features/stats/components/tokens-section"

const title = "Stats"
const description = "AI coding usage, models, and costs from Tokscale."
const ogImage = `/og/simple?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/stats" },
  openGraph: {
    url: "/stats",
    type: "website",
    images: { url: ogImage, width: 1200, height: 630, alt: title },
  },
  twitter: {
    card: "summary_large_image",
    site: X_HANDLE,
    creator: X_HANDLE,
    images: [ogImage],
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

      <TokensSection />
    </div>
  )
}
