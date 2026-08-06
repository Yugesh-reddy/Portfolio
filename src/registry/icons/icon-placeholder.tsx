"use client"

import type { IconLibraryName } from "shadcn/icons"

import { IconLucide } from "@/registry/icons/icon-lucide"

export function IconPlaceholder({
  ...props
}: {
  [K in IconLibraryName]: string
} & React.ComponentProps<"svg">) {
  const iconName = props.lucide

  if (!iconName) {
    return null
  }

  return <IconLucide name={iconName} {...props} />
}
