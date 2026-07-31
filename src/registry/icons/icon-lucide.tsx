"use client"

import { use } from "react"

const cache = new Map<string, Promise<unknown>>()

export function IconLucide({
  name,
  ...props
}: {
  name: string
} & React.ComponentProps<"svg">) {
  if (!cache.has(name)) {
    cache.set(
      name,
      import("./__lucide__").then(
        (mod) => (mod as Record<string, unknown>)[name] ?? null
      )
    )
  }

  const IconComponent = use(cache.get(name)!) as
    | React.ComponentType<React.ComponentProps<"svg">>
    | null

  if (!IconComponent) {
    return null
  }

  return <IconComponent {...props} />
}
