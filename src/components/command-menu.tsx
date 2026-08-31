"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "@bprogress/next/app"
import {
  BookmarkIcon,
  BoxIcon,
  BriefcaseBusinessIcon,
  CircleCheckBigIcon,
  CornerDownLeftIcon,
  DownloadIcon,
  FileTextIcon,
  GraduationCapIcon,
  MonitorIcon,
  MoonStarIcon,
  RssIcon,
  SparklesIcon,
  SunMediumIcon,
  TextInitialIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useHotkeys } from "react-hotkeys-hook"

import { trackEvent } from "@/lib/events"
import { cn } from "@/lib/utils"
import { useClickSound } from "@/hooks/soundcn/use-click-sound"
import { useMutationObserver } from "@/hooks/use-mutation-observer"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command"
import type { DocPreview } from "@/features/doc/types/document"
import { EveeChat } from "@/features/evee/components/evee-chat"
import { SOCIAL_LINKS } from "@/features/portfolio/data/social-links"

import { Icons } from "./icons"
import { PixelMark } from "./pixel-mark"
import { Button } from "./ui/button"
import { Kbd, KbdGroup } from "./ui/kbd"

type CommandKind = "command" | "page" | "link" | "ai"

type CommandLinkItem = {
  title: string
  href: string
  kind: CommandKind
  icon?: React.ReactElement
  iconImage?: string
  shortcut?: string
  keywords?: string[]
  openInNewTab?: boolean
}

const PORTFOLIO_LINKS: CommandLinkItem[] = [
  {
    title: "Home",
    href: "/",
    kind: "page",
    icon: <PixelMark />,
  },
  {
    title: "About",
    href: "/#about",
    kind: "page",
    icon: <TextInitialIcon />,
  },
  {
    title: "Education",
    href: "/#education",
    kind: "page",
    icon: <GraduationCapIcon />,
  },
  {
    title: "Experience",
    href: "/#experience",
    kind: "page",
    icon: <BriefcaseBusinessIcon />,
  },
  {
    title: "Projects",
    href: "/#projects",
    kind: "page",
    icon: <BoxIcon />,
  },
  {
    title: "Certifications",
    href: "/#certs",
    kind: "page",
    icon: <CircleCheckBigIcon />,
  },
  {
    title: "Bookmarks",
    href: "/#bookmarks",
    kind: "page",
    icon: <BookmarkIcon />,
  },
  {
    title: "Blog",
    href: "/blog",
    kind: "page",
    icon: <Icons.news />,
  },
]

const SOCIAL_LINK_ITEMS: CommandLinkItem[] = SOCIAL_LINKS.map((item) => ({
  title: item.title,
  href: item.href,
  kind: "link",
  iconImage: item.icon,
  openInNewTab: true,
}))

const OTHER_LINK_ITEMS: CommandLinkItem[] = [
  {
    title: "Download Resume",
    href: "/resume.pdf",
    kind: "link",
    icon: <DownloadIcon />,
    openInNewTab: true,
  },
  {
    title: "llms.txt",
    href: "/llms.txt",
    kind: "link",
    icon: <FileTextIcon />,
    openInNewTab: true,
  },
  {
    title: "RSS Feed",
    href: "/rss",
    kind: "link",
    icon: <RssIcon />,
    openInNewTab: true,
  },
]

export function CommandMenu({
  docs,
  enabledHotkeys = false,
}: {
  docs: DocPreview[]
  enabledHotkeys?: boolean
}) {
  const router = useRouter()

  const { setTheme } = useTheme()

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"command" | "chat">("command")
  const [searchValue, setSearchValue] = useState("")
  const [chatInitialQuery, setChatInitialQuery] = useState("")

  const [selectedCommandKind, setSelectedCommandKind] =
    useState<CommandKind | null>(null)

  const [click] = useClickSound()

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      setMode("command")
      setSearchValue("")
      setChatInitialQuery("")
      setSelectedCommandKind(null)
    }
  }, [])

  useHotkeys(
    "mod+k, slash",
    (e) => {
      e.preventDefault()

      setOpen((isOpen) => {
        const next = !isOpen
        if (next) {
          trackEvent({
            name: "open_command_menu",
            properties: {
              method: "keyboard",
              key: e.key === "/" ? "/" : e.metaKey ? "cmd+k" : "ctrl+k",
            },
          })
        } else {
          setMode("command")
          setSearchValue("")
          setChatInitialQuery("")
        }
        return next
      })
    },
    { enabled: enabledHotkeys }
  )

  const handleOpenLink = useCallback(
    (href: string, openInNewTab = false) => {
      handleOpenChange(false)

      trackEvent({
        name: "command_menu_action",
        properties: {
          action: "navigate",
          href: href,
          open_in_new_tab: openInNewTab,
        },
      })

      if (openInNewTab) {
        window.open(href, "_blank", "noopener")
      } else {
        router.push(href)
      }
    },
    [handleOpenChange, router]
  )

  const createThemeHandler = useCallback(
    (theme: "light" | "dark" | "system") => () => {
      click()
      handleOpenChange(false)

      trackEvent({
        name: "command_menu_action",
        properties: {
          action: "change_theme",
          theme: theme,
        },
      })

      setTheme(theme)
    },
    [click, handleOpenChange, setTheme]
  )

  const blogLinks = useMemo(
    () =>
      docs.map<CommandLinkItem>((doc) => ({
        title: doc.title,
        href: `/blog/${doc.slug}`,
        kind: "page",
        keywords: ["blog"],
      })),
    [docs]
  )

  const handleLinkHighlight = useCallback((link: CommandLinkItem) => {
    setSelectedCommandKind(link.kind)
  }, [])

  const handleCommandHighlight = useCallback(() => {
    setSelectedCommandKind("command")
  }, [])

  const startEveeChat = useCallback((query?: string) => {
    setChatInitialQuery(query || "")
    setMode("chat")
    trackEvent({
      name: "command_menu_action",
      properties: {
        action: "ask_evee",
        query: query || "",
      },
    })
  }, [])

  return (
    <>
      <CommandMenuTrigger
        onClick={() => {
          setOpen(true)
          trackEvent({
            name: "open_command_menu",
            properties: {
              method: "click",
            },
          })
        }}
      />

      <CommandDialog open={open} onOpenChange={handleOpenChange}>
        {/* Navigation / Ask Evee mode switch tab bar */}
        <div className="flex items-center justify-between border-b border-border/50 bg-muted/20 px-3 py-1.5">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMode("command")}
              className={cn(
                "cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors active:scale-95",
                mode === "command"
                  ? "bg-background text-foreground shadow-xs ring-1 ring-border/50"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              Navigation
            </button>
            <button
              type="button"
              onClick={() => startEveeChat(searchValue)}
              className={cn(
                "flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors active:scale-95",
                mode === "chat"
                  ? "bg-primary/15 font-semibold text-primary shadow-xs ring-1 ring-primary/30"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <SparklesIcon className="size-3 text-amber-500" />
              Ask Evee
            </button>
          </div>
        </div>

        {mode === "chat" ? (
          <EveeChat
            initialQuery={chatInitialQuery}
            onBack={() => {
              setMode("command")
              setChatInitialQuery("")
            }}
          />
        ) : (
          <>
            <CommandMenuInput
              value={searchValue}
              onValueChange={setSearchValue}
            />

            <div className="rounded-xl bg-background ring-1 ring-border">
              <CommandList className="min-h-80 supports-timeline-scroll:scroll-fade-effect-y">
                <CommandEmpty className="py-6 text-center text-sm">
                  <p className="text-muted-foreground">
                    No navigation matches found.
                  </p>
                  {searchValue.trim() && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEveeChat(searchValue.trim())}
                      className="mt-3 gap-1.5 border-primary/30 text-xs text-primary hover:bg-primary/10"
                    >
                      <SparklesIcon className="size-3.5 text-amber-500" />
                      Ask Evee &ldquo;{searchValue}&rdquo;
                    </Button>
                  )}
                </CommandEmpty>

                {searchValue.trim().length > 0 && (
                  <CommandGroup heading="AI Assistant">
                    <CommandMenuItem
                      value={`ask-evee-${searchValue}`}
                      keywords={[
                        "ask",
                        "evee",
                        "ai",
                        "chat",
                        "yugesh",
                        ...searchValue.toLowerCase().split(" "),
                      ]}
                      onHighlight={() => setSelectedCommandKind("ai")}
                      onSelect={() => startEveeChat(searchValue.trim())}
                      className="border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
                    >
                      <SparklesIcon className="size-4 shrink-0 text-amber-500" />
                      <span className="font-medium">
                        Ask Evee: &ldquo;{searchValue}&rdquo;
                      </span>
                      <CommandShortcut>↵</CommandShortcut>
                    </CommandMenuItem>
                  </CommandGroup>
                )}

                <CommandLinkGroup
                  heading="Portfolio"
                  links={PORTFOLIO_LINKS}
                  onLinkHighlight={handleLinkHighlight}
                  onLinkSelect={handleOpenLink}
                />

                <CommandLinkGroup
                  heading="Blog"
                  links={blogLinks}
                  fallbackIcon={<Icons.news />}
                  onLinkHighlight={handleLinkHighlight}
                  onLinkSelect={handleOpenLink}
                />

                <CommandLinkGroup
                  heading="Social Links"
                  links={SOCIAL_LINK_ITEMS}
                  onLinkHighlight={handleLinkHighlight}
                  onLinkSelect={handleOpenLink}
                />

                <CommandGroup heading="Theme">
                  <CommandMenuItem
                    keywords={["theme"]}
                    onHighlight={handleCommandHighlight}
                    onSelect={createThemeHandler("light")}
                  >
                    <SunMediumIcon />
                    Light
                  </CommandMenuItem>
                  <CommandMenuItem
                    keywords={["theme"]}
                    onHighlight={handleCommandHighlight}
                    onSelect={createThemeHandler("dark")}
                  >
                    <MoonStarIcon />
                    Dark
                  </CommandMenuItem>
                  <CommandMenuItem
                    keywords={["theme"]}
                    onHighlight={handleCommandHighlight}
                    onSelect={createThemeHandler("system")}
                  >
                    <MonitorIcon />
                    System
                  </CommandMenuItem>
                </CommandGroup>

                <CommandLinkGroup
                  heading="Other"
                  links={OTHER_LINK_ITEMS}
                  onLinkHighlight={handleLinkHighlight}
                  onLinkSelect={handleOpenLink}
                />
              </CommandList>
            </div>

            <CommandMenuFooter selectedCommandKind={selectedCommandKind} />
          </>
        )}
      </CommandDialog>
    </>
  )
}

function CommandMenuTrigger({ ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button
      data-slot="command-menu-trigger"
      className="h-8 gap-2 rounded-lg border-none bg-transparent px-2 text-muted-foreground shadow-none transition-colors select-none hover:bg-muted hover:text-foreground dark:hover:bg-neutral-800 dark:hover:text-foreground"
      variant="ghost"
      size="sm"
      {...props}
    >
      <Icons.search className="size-4 shrink-0" />

      <span className="font-sans text-sm/4 font-medium sm:hidden">Search…</span>

      <KbdGroup className="hidden gap-1 sm:in-[.os-macos_&]:flex">
        <Kbd className="size-5 min-w-5 rounded-[4px] p-0 text-xs font-normal">
          ⌘
        </Kbd>
        <Kbd className="size-5 min-w-5 rounded-[4px] p-0 text-xs font-normal">
          K
        </Kbd>
      </KbdGroup>

      <KbdGroup className="hidden gap-1 sm:not-[.os-macos_&]:flex">
        <Kbd className="h-5 min-w-5 rounded-[4px] px-1 text-xs font-normal">
          Ctrl
        </Kbd>
        <Kbd className="size-5 min-w-5 rounded-[4px] p-0 text-xs font-normal">
          K
        </Kbd>
      </KbdGroup>
    </Button>
  )
}

function CommandMenuInput({
  value,
  onValueChange,
}: {
  value: string
  onValueChange: (value: string) => void
}) {
  useEffect(() => {
    if (value.length >= 2) {
      const timeoutId = setTimeout(() => {
        trackEvent({
          name: "command_menu_search",
          properties: {
            query: value,
            query_length: value.length,
          },
        })
      }, 500)

      return () => clearTimeout(timeoutId)
    }
  }, [value])

  return (
    <CommandInput
      placeholder="Search or ask Evee…"
      value={value}
      onValueChange={onValueChange}
    />
  )
}

function CommandMenuItem({
  children,
  onHighlight,
  ...props
}: React.ComponentProps<typeof CommandItem> & {
  onHighlight?: () => void
  "data-selected"?: string
  "aria-selected"?: string
}) {
  const ref = React.useRef<HTMLDivElement>(null)

  useMutationObserver(ref, (mutations) => {
    mutations.forEach((mutation) => {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "aria-selected" &&
        ref.current?.getAttribute("aria-selected") === "true"
      ) {
        onHighlight?.()
      }
    })
  })

  return (
    <CommandItem ref={ref} {...props}>
      {children}
    </CommandItem>
  )
}

function CommandLinkGroup({
  heading,
  links,
  fallbackIcon,
  onLinkHighlight,
  onLinkSelect,
}: {
  heading: string
  links: CommandLinkItem[]
  fallbackIcon?: React.ReactElement
  onLinkHighlight: (link: CommandLinkItem) => void
  onLinkSelect: (href: string, openInNewTab?: boolean) => void
}) {
  return (
    <CommandGroup heading={heading}>
      {links.map((link) => {
        const icon = link?.icon ?? fallbackIcon ?? <React.Fragment />

        return (
          <CommandMenuItem
            key={link.href}
            keywords={link.keywords}
            onHighlight={() => onLinkHighlight(link)}
            onSelect={() => onLinkSelect(link.href, link.openInNewTab)}
          >
            {link?.iconImage ? (
              <img
                className="size-4 rounded-sm"
                src={link.iconImage}
                alt={link.title}
              />
            ) : (
              icon
            )}

            <p className="line-clamp-1">{link.title}</p>

            {link.shortcut && (
              <CommandShortcut className="font-mono tracking-[0.2em] max-sm:hidden">
                {link.shortcut}
              </CommandShortcut>
            )}
          </CommandMenuItem>
        )
      })}
    </CommandGroup>
  )
}

const ENTER_ACTION_LABELS: Record<CommandKind, string> = {
  command: "Run Command",
  page: "Go to Page",
  link: "Open Link",
  ai: "Ask Evee",
}

function CommandMenuFooter({
  selectedCommandKind,
}: {
  selectedCommandKind: CommandKind | null
}) {
  return (
    <>
      <div className="flex h-10" />

      <div className="absolute inset-x-0 bottom-0 flex h-10 items-center justify-between gap-2 rounded-b-2xl px-4 text-xs font-medium">
        <PixelMark className="size-6 text-muted-foreground" />

        <div className="flex items-center gap-2 max-sm:hidden">
          <span>{ENTER_ACTION_LABELS[selectedCommandKind ?? "page"]}</span>
          <Kbd>
            <CornerDownLeftIcon />
          </Kbd>
        </div>
      </div>
    </>
  )
}
