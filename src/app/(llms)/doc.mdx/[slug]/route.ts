import { notFound } from "next/navigation"
import { format } from "date-fns"

import { getAllDocs } from "@/features/doc/data/documents"

export const revalidate = false
export const dynamic = "force-static"
export const dynamicParams = false

export async function generateStaticParams() {
  return getAllDocs().map((doc) => ({
    slug: doc.slug,
  }))
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const doc = getAllDocs().find((d) => d.slug === slug)

  if (!doc) {
    notFound()
  }

  // Blog content is plain Markdown/MDX prose, so the raw body is already
  // valid Markdown. Prepend the title/description and append the date.
  const markdown = `# ${doc.metadata.title}

${doc.metadata.description}

${doc.content}

Last updated on ${format(new Date(doc.metadata.updatedAt), "MMMM d, yyyy")}
`

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown;charset=utf-8",
    },
  })
}
