"use client"

import { copyText } from "@/utils/copy"
import { toast } from "sonner"

export function SocialCopyButton({
  className,
  title,
  handle,
  children,
}: {
  className?: string
  title: string
  handle: string
  children: React.ReactNode
}) {
  return (
    <button
      className={className}
      type="button"
      onClick={async () => {
        const copied = await copyText(handle)

        if (copied) {
          toast.success(`${title} handle copied`, { description: handle })
        } else {
          toast.error(`Could not copy. The handle is ${handle}`)
        }
      }}
    >
      {children}
      <span className="sr-only">{`Copy ${title} handle, ${handle}`}</span>
    </button>
  )
}
