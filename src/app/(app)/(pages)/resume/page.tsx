import type { Metadata } from "next"
import { DownloadIcon, ExternalLinkIcon, FileTextIcon } from "lucide-react"

import { X_HANDLE } from "@/config/site"
import { Button } from "@/components/ui/button"
import {
  PageHeading,
  PageHeadingDescription,
  PageHeadingTagline,
  PageHeadingTitle,
} from "@/components/page-heading"
import { DocShareMenu } from "@/features/doc/components/doc-share-menu"
import { USER } from "@/features/portfolio/data/user"

const title = "Resume"
const description = "Experience, projects, and education in a single PDF."

const ogImage = `/og/simple?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`

// The PDF lives in /public, so it is same-origin and the `download` attribute works.
const RESUME_FILE = "/resume.pdf"
const DOWNLOAD_NAME = `${USER.displayName.replace(/\s+/g, "-")}-Resume.pdf`

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/resume",
  },
  openGraph: {
    url: "/resume",
    type: "website",
    images: {
      url: ogImage,
      width: 1200,
      height: 630,
      alt: title,
    },
  },
  twitter: {
    card: "summary_large_image",
    site: X_HANDLE,
    creator: X_HANDLE,
    images: [ogImage],
  },
}

export default function ResumePage() {
  return (
    <div className="min-h-svh">
      <PageHeading>
        <PageHeadingTagline>Resume</PageHeadingTagline>
        <PageHeadingTitle>The short version, on one page.</PageHeadingTitle>
        <PageHeadingDescription>
          Experience, projects, and education as a PDF. Read it below or take a
          copy with you.
        </PageHeadingDescription>
      </PageHeading>

      <div className="screen-line-bottom flex items-center justify-between gap-2 p-2 pl-4">
        <span className="font-mono text-[0.8125rem] text-muted-foreground">
          resume.pdf
        </span>

        <div className="flex items-center gap-2">
          <Button
            className="h-7 gap-1.5 border-none px-2 text-[0.8125rem] active:scale-none"
            variant="secondary"
            size="sm"
            asChild
          >
            <a href={RESUME_FILE} download={DOWNLOAD_NAME}>
              <DownloadIcon />
              Download
            </a>
          </Button>

          <DocShareMenu title={`${USER.displayName} resume`} url="/resume" />
        </div>
      </div>

      <div className="p-2">
        {/*
          Rendered only on sm and up. Mobile browsers (iOS Safari in particular)
          routinely refuse to paint an inline PDF and leave a blank frame with no
          way to recover, so small screens get the explicit card below instead.
        */}
        <object
          className="aspect-[8.5/11] w-full rounded-lg border border-line bg-muted max-sm:hidden"
          data={`${RESUME_FILE}#toolbar=0&navpanes=0&view=FitH`}
          type="application/pdf"
          aria-label={`${USER.displayName} resume, PDF preview`}
        >
          <ResumeFallback>
            This browser cannot display PDFs inline.
          </ResumeFallback>
        </object>

        <div className="sm:hidden">
          <ResumeFallback>
            The inline preview needs a wider screen. Open the PDF in a new tab
            or download it.
          </ResumeFallback>
        </div>
      </div>

      <div className="h-4" />
    </div>
  )
}

function ResumeFallback({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-line bg-muted px-6 py-12 text-center">
      <FileTextIcon className="size-8 text-muted-foreground" aria-hidden />

      <p className="max-w-xs text-sm text-balance text-muted-foreground">
        {children}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button size="sm" asChild>
          <a href={RESUME_FILE} target="_blank" rel="noopener">
            <ExternalLinkIcon />
            Open PDF
          </a>
        </Button>

        <Button variant="outline" size="sm" asChild>
          <a href={RESUME_FILE} download={DOWNLOAD_NAME}>
            <DownloadIcon />
            Download
          </a>
        </Button>
      </div>
    </div>
  )
}
