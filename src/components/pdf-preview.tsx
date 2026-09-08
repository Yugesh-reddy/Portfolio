"use client"

import { useEffect, useRef, useState } from "react"
import { MinusIcon, PlusIcon } from "lucide-react"
import { Document, Page, pdfjs } from "react-pdf"

import { Button } from "@/components/ui/button"

import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"

// Bundle the worker locally, using the same PDF.js version as React-PDF.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString()

export default function PdfPreview({
  file,
  fallback,
}: {
  file: string
  fallback: React.ReactNode
}) {
  const container = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [pages, setPages] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const element = container.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.floor(entry.contentRect.width))
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      aria-label="Resume PDF preview"
      className="overflow-hidden rounded-lg border border-line"
    >
      {!failed && (
        <div className="flex items-center justify-end gap-1 border-b border-line bg-muted p-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Zoom out"
            disabled={zoom <= 1}
            onClick={() => setZoom((value) => Math.max(1, value - 0.25))}
          >
            <MinusIcon />
          </Button>
          <span
            className="w-10 text-center font-mono text-xs"
            aria-live="polite"
          >
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Zoom in"
            disabled={zoom >= 3}
            onClick={() => setZoom((value) => Math.min(3, value + 0.25))}
          >
            <PlusIcon />
          </Button>
        </div>
      )}
      <div
        ref={container}
        className="overflow-auto overscroll-x-contain bg-muted"
      >
        {failed
          ? fallback
          : width > 0 && (
              <Document
                file={file}
                loading={
                  <p className="p-6 text-center text-sm" role="status">
                    Loading PDF…
                  </p>
                }
                error={fallback}
                onLoadSuccess={({ numPages }) => setPages(numPages)}
                onLoadError={() => setFailed(true)}
                onSourceError={() => setFailed(true)}
                externalLinkTarget="_blank"
                externalLinkRel="noopener noreferrer"
              >
                {Array.from({ length: pages }, (_, index) => (
                  <Page
                    key={index + 1}
                    pageNumber={index + 1}
                    width={Math.floor(width * zoom)}
                    className="mb-2 last:mb-0"
                    loading={
                      <p className="p-6 text-sm" role="status">
                        Rendering page {index + 1}…
                      </p>
                    }
                    onRenderError={() => setFailed(true)}
                    onLoadError={() => setFailed(true)}
                  />
                ))}
              </Document>
            )}
      </div>
    </section>
  )
}
