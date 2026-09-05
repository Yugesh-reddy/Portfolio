import dynamic from "next/dynamic"
import Link from "next/link"

import { MAIN_NAV } from "@/config/site"
import { Separator } from "@/components/ui/separator"
import { NavDesktop } from "@/components/nav-desktop"
import { NavItemGitHub } from "@/components/nav-item-github"
import { PixelMark } from "@/components/pixel-mark"
import { ThemeToggle } from "@/components/theme-toggle"
import { getAllDocs } from "@/features/doc/data/documents"
import type { DocPreview } from "@/features/doc/types/document"

const CommandMenu = dynamic(() =>
  import("@/components/command-menu").then((mod) => mod.CommandMenu)
)

export function SiteHeader() {
  const docs = getAllDocs()

  // Minimize data serialized to client component - only send necessary fields
  const docPreviews: DocPreview[] = docs.map((doc) => ({
    slug: doc.slug,
    title: doc.metadata.title,
    category: doc.metadata.category,
  }))

  return (
    <header className="sticky top-0 z-50 max-w-screen overflow-x-hidden bg-background px-2">
      <div className="screen-line-top screen-line-bottom mx-auto flex h-12 items-center justify-between gap-2 border-x border-line pr-2 pl-4 group-has-data-[slot=layout-wide]/layout:container after:z-1 after:transition-[background-color] sm:gap-4 md:max-w-3xl">
        <Link
          className="transition-[scale] ease-out active:scale-[0.98] [&_svg]:h-6 [&_svg]:shrink-0"
          href="/"
          aria-label="Home"
        >
          <PixelMark className="h-6 shrink-0" />
        </Link>

        <div className="flex-1" />

        <NavDesktop items={MAIN_NAV} />

        <div className="flex items-center max-sm:*:data-[slot=command-menu-trigger]:hidden">
          <Separator
            orientation="vertical"
            className="mr-2 max-sm:hidden data-vertical:h-4 data-vertical:self-center"
          />
          <CommandMenu docs={docPreviews} enabledHotkeys />
          <Separator
            orientation="vertical"
            className="mx-2 max-sm:hidden data-vertical:h-4 data-vertical:self-center"
          />
          <NavItemGitHub />
          <Separator
            orientation="vertical"
            className="mx-2 data-vertical:h-4 data-vertical:self-center"
          />
          <ThemeToggle />
        </div>

        {/* <div className="absolute top-[-3.5px] left-[-4.5px] z-2 flex size-2 border border-line bg-background" /> */}
        {/* <div className="absolute top-[-3.5px] right-[-4.5px] z-2 flex size-2 border border-line bg-background" /> */}
      </div>
    </header>
  )
}
