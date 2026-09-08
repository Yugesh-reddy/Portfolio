"use client"

import dynamic from "next/dynamic"

const PdfPreview = dynamic(() => import("./pdf-preview"), {
  ssr: false,
  loading: () => (
    <p className="p-6 text-center text-sm" role="status">
      Loading PDF…
    </p>
  ),
})

export function PdfViewer({
  file,
  fallback,
}: {
  file: string
  fallback: React.ReactNode
}) {
  return (
    <>
      <PdfPreview file={file} fallback={fallback} />
      <noscript>{fallback}</noscript>
    </>
  )
}
