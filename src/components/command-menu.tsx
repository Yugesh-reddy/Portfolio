"use client"

import React, { useCallback, useState } from "react"
import dynamic from "next/dynamic"
import { useHotkeys } from "react-hotkeys-hook"

import { trackEvent } from "@/lib/events"
import type { DocPreview } from "@/features/doc/types/document"
import { MAX_MESSAGE_LENGTH } from "@/features/evee/lib/chat-limits"

import { Icons } from "./icons"
import { Button } from "./ui/button"
import { Kbd, KbdGroup } from "./ui/kbd"
import { Separator } from "./ui/separator"

const CommandMenuDialog = dynamic(
  () => import("./command-menu-dialog").then((mod) => mod.CommandMenuDialog),
  { ssr: false }
)

const preloadDialog = () => {
  void import("./command-menu-dialog")
}

const preloadEvee = () => {
  void import("./command-menu-dialog")
  void import("@/features/evee/components/evee-chat")
}

export function CommandMenu({
  docs,
  enabledHotkeys = false,
  showEveeTrigger = false,
}: {
  docs: DocPreview[]
  enabledHotkeys?: boolean
  showEveeTrigger?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [hasOpenedChat, setHasOpenedChat] = useState(false)
  const [mode, setMode] = useState<"command" | "chat">("command")
  const [chatInitialQuery, setChatInitialQuery] = useState("")

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen)
    if (nextOpen) {
      setHasLoaded(true)
    } else {
      setMode("command")
      setChatInitialQuery("")
      setHasOpenedChat(false)
    }
  }, [])

  const handleModeChange = useCallback((nextMode: "command" | "chat") => {
    setMode(nextMode)
    if (nextMode === "command") {
      setChatInitialQuery("")
    }
  }, [])

  const startEveeChat = useCallback((query?: string) => {
    setHasLoaded(true)
    setHasOpenedChat(true)
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

  useHotkeys(
    "mod+k, slash",
    (e) => {
      e.preventDefault()

      setOpen((isOpen) => {
        const next = !isOpen
        if (next) {
          setHasLoaded(true)
          trackEvent({
            name: "open_command_menu",
            properties: {
              method: "keyboard",
              key: e.key === "/" ? "/" : e.metaKey ? "cmd+k" : "ctrl+k",
            },
          })
        } else {
          setMode("command")
          setChatInitialQuery("")
          setHasOpenedChat(false)
        }
        return next
      })
    },
    { enabled: enabledHotkeys }
  )

  return (
    <>
      {showEveeTrigger && (
        <>
          <button
            type="button"
            aria-haspopup="dialog"
            className="relative mr-4 cursor-pointer text-sm font-medium text-muted-foreground transition-colors after:absolute after:-inset-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            onPointerEnter={preloadEvee}
            onFocus={preloadEvee}
            onClick={() => {
              setOpen(true)
              startEveeChat()
            }}
          >
            Evee
          </button>
          <Separator
            orientation="vertical"
            className="mr-2 max-sm:hidden data-vertical:h-4 data-vertical:self-center"
          />
        </>
      )}
      <CommandMenuTrigger
        onPointerEnter={preloadDialog}
        onFocus={preloadDialog}
        onClick={() => {
          setHasLoaded(true)
          setOpen(true)
          trackEvent({
            name: "open_command_menu",
            properties: {
              method: "click",
            },
          })
        }}
      />

      {hasLoaded ? (
        <CommandMenuDialog
          docs={docs}
          open={open}
          mode={mode}
          hasOpenedChat={hasOpenedChat}
          chatInitialQuery={chatInitialQuery}
          onOpenChange={handleOpenChange}
          onModeChange={handleModeChange}
          onStartEveeChat={startEveeChat}
        />
      ) : null}
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
