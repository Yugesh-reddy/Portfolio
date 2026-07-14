import type { ImageProps } from "next/image"
import Image from "next/image"
import Link from "next/link"
import { differenceInCalendarDays, format, max } from "date-fns"

import type { Doc } from "@/features/doc/types/document"

/** Posts created or updated within this many days show the active "new" dot. */
const RECENT_POST_DAYS = 14

function isRecentPost(post: Doc, now = new Date()) {
  const createdAt = new Date(post.metadata.createdAt)
  const updatedAt = new Date(post.metadata.updatedAt)
  const latest = max([createdAt, updatedAt])
  return differenceInCalendarDays(now, latest) <= RECENT_POST_DAYS
}

export function PostItem({
  post,
  imageLoading = "lazy",
}: {
  post: Doc
  imageLoading?: ImageProps["loading"]
}) {
  const showNewDot = isRecentPost(post)

  return (
    <div className="relative flex h-full flex-col gap-2 p-2 transition-[background-color] ease-out hover:bg-accent-muted">
      {post.metadata.image && (
        <div className="relative select-none [--image-radius:var(--radius-xl)]">
          <Image
            className="aspect-1200/630 rounded-(--image-radius)"
            src={post.metadata.image}
            alt={post.metadata.title}
            width={1200}
            height={630}
            quality={100}
            loading={imageLoading}
            unoptimized
          />
          <div className="pointer-events-none absolute inset-0 rounded-(--image-radius) inset-ring-1 inset-ring-black/10 dark:inset-ring-white/10" />
        </div>
      )}

      <div className="flex flex-col gap-1 p-2">
        <h3 className="flex items-center gap-2 text-lg leading-snug font-medium text-balance">
          <Link href={`/blog/${post.slug}`}>
            <span className="absolute inset-0" aria-hidden />
            {post.metadata.title}
          </Link>

          {showNewDot && (
            <span
              className="pointer-events-none relative inline-flex size-2 shrink-0 -translate-y-px items-center justify-center"
              aria-label="New"
            >
              <span className="absolute inline-flex size-3 animate-ping rounded-full bg-info opacity-50" />
              <span className="relative inline-flex size-2 rounded-full bg-info" />
            </span>
          )}
        </h3>

        <dl>
          <dt className="sr-only">Published on</dt>
          <dd className="text-sm text-muted-foreground">
            <time dateTime={new Date(post.metadata.createdAt).toISOString()}>
              {format(new Date(post.metadata.createdAt), "dd.MM.yyyy")}
            </time>
          </dd>
        </dl>
      </div>
    </div>
  )
}
