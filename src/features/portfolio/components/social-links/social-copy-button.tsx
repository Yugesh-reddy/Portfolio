"use client"

import { copyText } from "@/utils/copy"
import { toast } from "sonner"

export function SocialCopyButton({
  className,
  title,
  handle,
  children,
  onClick,
  ...props
}: React.ComponentProps<"button"> & {
  title: string
  handle: string
}) {
  return (
    <button
      {...props}
      className={className}
      type="button"
      onClick={async (event) => {
        onClick?.(event)
        if (event.defaultPrevented) return

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
