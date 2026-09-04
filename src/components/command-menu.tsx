"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
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
  SunMediumIcon,
  TextInitialIcon,
} from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
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
import { EveeIcon } from "@/features/evee/components/evee-avatar"
import { EveeChat } from "@/features/evee/components/evee-chat"
import { MAX_MESSAGE_LENGTH } from "@/features/evee/lib/chat-limits"
import { getPanelPresentation } from "@/features/evee/lib/chat-surface"
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
  const commandInputRef = useRef<HTMLInputElement>(null)
  const reduceMotion = useReducedMotion() ?? false

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

  useEffect(() => {
    if (!open || mode !== "command") return

    const frameId = requestAnimationFrame(() =>
      commandInputRef.current?.focus()
    )
    return () => cancelAnimationFrame(frameId)
  }, [mode, open])

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
    setChatInitialQuery(query?.slice(0, MAX_MESSAGE_LENGTH) || "")
    setMode("chat")
    trackEvent({
      name: "command_menu_action",
      properties: {
        action: "ask_evee",
        query: query || "",
      },
    })
  }, [])

  const chatPanel = getPanelPresentation(mode, "chat", reduceMotion)
  const commandPanel = getPanelPresentation(mode, "command", reduceMotion)
  const panelTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.22, ease: [0.77, 0, 0.175, 1] as const }

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

      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        title={mode === "chat" ? "Ask Evee" : "Command Palette"}
        description={
          mode === "chat"
            ? "Ask questions about Yugesh's work and experience."
            : "Search for a command to run."
        }
      >
        <motion.div
          layout={reduceMotion ? false : "size"}
          transition={{ layout: panelTransition }}
          className="relative w-full overflow-hidden"
        >
          <motion.div
            initial={false}
            aria-hidden={chatPanel.ariaHidden}
            inert={chatPanel.inert}
            animate={{
              opacity: chatPanel.opacity,
              transform: chatPanel.transform,
              filter: chatPanel.filter,
            }}
            transition={panelTransition}
            className={cn(
              "w-full",
              mode !== "chat" && "pointer-events-none absolute inset-0"
            )}
          >
            <EveeChat
              active={mode === "chat"}
              initialQuery={chatInitialQuery}
              onBack={() => {
                setMode("command")
                setChatInitialQuery("")
              }}
              onNavigate={() => handleOpenChange(false)}
            />
          </motion.div>

          <motion.div
            initial={false}
            aria-hidden={commandPanel.ariaHidden}
            inert={commandPanel.inert}
            animate={{
              opacity: commandPanel.opacity,
              transform: commandPanel.transform,
              filter: commandPanel.filter,
            }}
            transition={panelTransition}
            className={cn(
              "w-full",
              mode !== "command" && "pointer-events-none absolute inset-0"
            )}
          >
            <CommandMenuInput
              inputRef={commandInputRef}
              value={searchValue}
              onValueChange={setSearchValue}
            />

            <div className="mx-1 rounded-xl bg-background ring-1 ring-border">
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
                      className="mt-3 cursor-pointer gap-1.5 text-xs active:scale-95"
                    >
                      <EveeIcon className="size-3.5" />
                      Ask Evee &ldquo;{searchValue}&rdquo;
                    </Button>
                  )}
                </CommandEmpty>

                <CommandGroup heading="AI Assistant">
                  <CommandMenuItem
                    value={
                      searchValue.trim()
                        ? `ask-evee-${searchValue}`
                        : "ask-evee"
                    }
                    keywords={[
                      "ask",
                      "evee",
                      "ai",
                      "chat",
                      "yugesh",
                      "research",
                      "projects",
                      "skills",
                      ...(searchValue.trim()
                        ? searchValue.toLowerCase().split(" ")
                        : []),
                    ]}
                    onHighlight={() => setSelectedCommandKind("ai")}
                    onSelect={() => startEveeChat(searchValue.trim())}
                  >
                    <EveeIcon />
                    <p className="line-clamp-1">
                      {searchValue.trim()
                        ? `Ask Evee: "${searchValue}"`
                        : "Ask Evee"}
                    </p>
                  </CommandMenuItem>
                </CommandGroup>

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
          </motion.div>
        </motion.div>
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
  inputRef,
  value,
  onValueChange,
}: {
  inputRef: React.Ref<HTMLInputElement>
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
      ref={inputRef}
      placeholder="Search or ask Evee…"
      value={value}
      maxLength={MAX_MESSAGE_LENGTH}
      onValueChange={(nextValue) =>
        onValueChange(nextValue.slice(0, MAX_MESSAGE_LENGTH))
      }
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
