"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  ArrowUpIcon,
  ArrowUpRightIcon,
  RotateCcwIcon,
  SquareIcon,
} from "lucide-react"
import ReactMarkdown from "react-markdown"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { MAX_MESSAGE_LENGTH } from "@/features/evee/lib/chat-limits"
import {
  appendAssistantChunk,
  createPendingTurn,
  type ChatMessage,
} from "@/features/evee/lib/chat-state"
import {
  consumePendingInitialEveeQuery,
  getComposerControl,
  getEveeRequestDisposition,
  getEveeSurfaceSize,
  shouldContainEveeKey,
  shouldSubmitInitialEveeQuery,
  type EveeRequestExit,
  type EveeRequestStatus,
} from "@/features/evee/lib/chat-surface"

import { EveeAvatar } from "./evee-avatar"

const STARTER_QUESTIONS = [
  {
    label: "Overview",
    question: "Give me the 30-second overview of Yugesh.",
  },
  {
    label: "Research",
    question: "Why is his AI safety work interesting?",
  },
  {
    label: "Experience",
    question: "What did he ship at UI Health?",
  },
  {
    label: "Role fit",
    question: "Which AI engineering roles fit him best?",
  },
] as const

type FailedTurn = {
  text: string
  userMessageId: string
}

function getResponseError(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Evee could not answer that question."
}

export function EveeChat({
  active = true,
  initialQuery = "",
  className,
  onBack,
  onNavigate,
}: {
  active?: boolean
  initialQuery?: string
  className?: string
  onBack?: () => void
  onNavigate?: () => void
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [status, setStatus] = useState<EveeRequestStatus>("idle")
  const [error, setError] = useState<string | null>(null)
  const [failedTurn, setFailedTurn] = useState<FailedTurn | null>(null)

  const activeRequestRef = useRef<AbortController | null>(null)
  const messagesRef = useRef<ChatMessage[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lastInitialQueryRef = useRef("")

  const replaceMessages = useCallback((nextMessages: ChatMessage[]) => {
    messagesRef.current = nextMessages
    setMessages(nextMessages)
  }, [])

  const sendMessage = useCallback(
    async (textToSend: string, replaceUserMessageId?: string) => {
      const text = textToSend.trim()
      if (!text || activeRequestRef.current) return

      const controller = new AbortController()
      const userMessageId = crypto.randomUUID()
      const assistantMessageId = crypto.randomUUID()
      const turn = createPendingTurn(messagesRef.current, text, {
        userMessageId,
        assistantMessageId,
        replaceUserMessageId,
      })

      activeRequestRef.current = controller
      replaceMessages(turn.messages)
      setError(null)
      setFailedTurn(null)
      setInput("")
      setStatus("submitting")

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: turn.requestMessages }),
          signal: controller.signal,
        })

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as {
            error?: string
          } | null

          throw new Error(body?.error ?? "Evee could not answer that question.")
        }

        if (!response.body) {
          throw new Error("Evee returned an empty response. Please try again.")
        }

        setStatus("streaming")
        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const result = await reader.read()
          if (result.done) break

          const chunk = decoder.decode(result.value, { stream: true })
          if (!chunk) continue

          replaceMessages(
            appendAssistantChunk(messagesRef.current, assistantMessageId, chunk)
          )
        }

        const finalChunk = decoder.decode()
        if (finalChunk) {
          replaceMessages(
            appendAssistantChunk(
              messagesRef.current,
              assistantMessageId,
              finalChunk
            )
          )
        }
      } catch (requestError) {
        if (controller.signal.aborted) {
          if (activeRequestRef.current === controller) {
            const assistantMessage = messagesRef.current.find(
              (message) => message.id === assistantMessageId
            )

            if (!assistantMessage?.content) {
              replaceMessages(
                messagesRef.current.filter(
                  (message) => message.id !== assistantMessageId
                )
              )
            }
          }
          return
        }

        console.error("Evee request failed.", requestError)
        replaceMessages(
          messagesRef.current.filter(
            (message) => message.id !== assistantMessageId
          )
        )
        setError(getResponseError(requestError))
        setFailedTurn({ text, userMessageId })
      } finally {
        if (activeRequestRef.current === controller) {
          activeRequestRef.current = null
          setStatus("idle")
        }
      }
    },
    [replaceMessages]
  )

  useEffect(() => {
    if (active) messagesEndRef.current?.scrollIntoView({ block: "end" })
  }, [active, messages])

  useEffect(() => {
    if (active && status === "idle") textareaRef.current?.focus()
  }, [active, messages.length, status])

  useEffect(() => {
    if (!initialQuery) {
      lastInitialQueryRef.current = ""
      return
    }

    if (
      shouldSubmitInitialEveeQuery({
        active,
        status,
        initialQuery,
        lastInitialQuery: lastInitialQueryRef.current,
      })
    ) {
      lastInitialQueryRef.current = initialQuery
      void sendMessage(initialQuery)
    }
  }, [active, initialQuery, sendMessage, status])

  const handleRequestExit = useCallback((reason: EveeRequestExit) => {
    if (getEveeRequestDisposition(reason) === "abort") {
      activeRequestRef.current?.abort()
    }
  }, [])

  useEffect(() => () => handleRequestExit("unmount"), [handleRequestExit])

  const clearChat = () => {
    lastInitialQueryRef.current = consumePendingInitialEveeQuery(initialQuery)
    handleRequestExit("clear")
    activeRequestRef.current = null
    replaceMessages([])
    setError(null)
    setFailedTurn(null)
    setInput("")
    setStatus("idle")
  }

  const handleBack = () => {
    handleRequestExit("back")
    onBack?.()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      void sendMessage(input)
    }
  }

  const composerControl = getComposerControl(status, input)
  const isRequestActive = composerControl.action === "stop"
  const surfaceSize = getEveeSurfaceSize(messages.length)

  return (
    <section
      aria-label="Ask Evee about Yugesh"
      onKeyDown={(event) => {
        if (shouldContainEveeKey(event)) event.stopPropagation()
      }}
      className={cn(
        "flex flex-col overflow-hidden bg-surface text-foreground max-sm:h-[calc(100dvh-5rem)] max-sm:min-h-0",
        surfaceSize === "compact"
          ? "h-[min(440px,80dvh)] min-h-[400px]"
          : "h-[min(560px,80dvh)] min-h-[440px]",
        className
      )}
    >
      <header className="flex h-12 shrink-0 items-center justify-between gap-2 px-3">
        <div className="flex min-w-0 items-center gap-2">
          {onBack && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="size-8 shrink-0 rounded-lg text-muted-foreground transition-[color,background-color,transform] duration-150 hover:text-foreground active:scale-[0.97]"
              aria-label="Back to search"
            >
              <ArrowLeftIcon className="size-4" />
            </Button>
          )}

          <EveeAvatar size="sm" />
          <h2 className="truncate text-sm font-medium">Ask Evee</h2>
        </div>

        {messages.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={clearChat}
            className="size-8 shrink-0 rounded-lg text-muted-foreground transition-[color,background-color,transform] duration-150 hover:text-foreground active:scale-[0.97]"
            aria-label="Clear conversation"
          >
            <RotateCcwIcon className="size-4" />
          </Button>
        )}
      </header>

      <div className="mx-1 flex-1 overflow-y-auto rounded-xl bg-background ring-1 ring-border supports-timeline-scroll:scroll-fade-effect-y">
        {messages.length === 0 ? (
          <div className="p-2">
            <p className="px-2 py-2 text-xs font-medium text-muted-foreground">
              Suggested
            </p>
            <div className="space-y-1">
              {STARTER_QUESTIONS.map((starter) => (
                <button
                  key={starter.label}
                  type="button"
                  onClick={() => void sendMessage(starter.question)}
                  className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-left text-sm transition-[color,background-color,transform] duration-150 hover:bg-accent hover:text-accent-foreground active:scale-[0.98]"
                >
                  <span>{starter.question}</span>
                  <ArrowUpRightIcon className="size-4 shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div
            role="log"
            aria-live="polite"
            aria-busy={isRequestActive}
            className="space-y-5 px-4 py-4"
          >
            {messages.map((message) =>
              message.role === "user" ? (
                <div key={message.id} className="flex justify-end pl-10">
                  <p className="max-w-[86%] rounded-xl bg-foreground px-3 py-2 text-sm leading-relaxed text-background">
                    {message.content}
                  </p>
                </div>
              ) : (
                <div
                  key={message.id}
                  className="flex items-start gap-3 pr-2 text-sm"
                >
                  <EveeAvatar size="sm" className="mt-0.5" />
                  <div className="min-w-0 flex-1">
                    {message.content ? (
                      <div className="prose prose-sm max-w-none break-words text-foreground dark:prose-invert prose-p:my-1.5 prose-p:leading-relaxed prose-a:font-medium prose-a:text-foreground prose-a:underline prose-a:decoration-border prose-a:underline-offset-4 hover:prose-a:decoration-foreground prose-strong:font-semibold prose-ul:my-2 prose-ul:pl-4 prose-li:my-1">
                        <ReactMarkdown
                          components={{
                            a: ({ href, children }) => {
                              const external = href?.startsWith("http")

                              return (
                                <a
                                  href={href}
                                  onClick={
                                    href?.startsWith("/")
                                      ? onNavigate
                                      : undefined
                                  }
                                  target={external ? "_blank" : undefined}
                                  rel={
                                    external ? "noreferrer noopener" : undefined
                                  }
                                >
                                  {children}
                                </a>
                              )
                            },
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div
                        className="space-y-2.5 py-1.5 motion-safe:animate-pulse"
                        aria-label="Evee is preparing an answer"
                      >
                        <div className="h-3 w-11/12 rounded-sm bg-muted" />
                        <div className="h-3 w-9/12 rounded-sm bg-muted" />
                        <div className="h-3 w-7/12 rounded-sm bg-muted" />
                      </div>
                    )}
                  </div>
                </div>
              )
            )}

            {error && failedTurn && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-lg bg-destructive/8 p-3 text-sm text-destructive ring-1 ring-destructive/20"
              >
                <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    Evee could not finish the answer.
                  </p>
                  <p className="mt-1 text-xs leading-relaxed opacity-90">
                    {error}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    void sendMessage(failedTurn.text, failedTurn.userMessageId)
                  }
                  className="h-7 shrink-0 rounded-lg border-destructive/30 px-2 text-xs text-destructive transition-transform duration-150 hover:bg-destructive/10 active:scale-[0.97]"
                >
                  Retry
                </Button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <footer className="shrink-0 p-2">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void sendMessage(input)
          }}
          className="mx-1 flex min-h-11 items-end gap-2 rounded-xl bg-background px-3 py-2 ring-1 ring-border transition-[box-shadow] duration-150 focus-within:ring-foreground/25"
        >
          <label htmlFor="evee-question" className="sr-only">
            Ask Evee
          </label>
          <textarea
            id="evee-question"
            ref={textareaRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Evee…"
            rows={1}
            maxLength={MAX_MESSAGE_LENGTH}
            disabled={isRequestActive}
            className="field-sizing-content max-h-24 min-h-7 flex-1 resize-none bg-transparent py-0.5 text-sm leading-6 text-foreground outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
          />

          {composerControl.action === "stop" ? (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => handleRequestExit("stop")}
              className="size-8 shrink-0 rounded-lg transition-transform duration-150 active:scale-[0.97]"
              aria-label="Stop generating"
            >
              <SquareIcon className="size-3 fill-current" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              disabled={composerControl.disabled}
              className="size-8 shrink-0 rounded-lg bg-foreground text-background transition-transform duration-150 hover:bg-foreground/90 active:scale-[0.97] disabled:opacity-25"
              aria-label="Send question"
            >
              <ArrowUpIcon className="size-4" />
            </Button>
          )}
        </form>
      </footer>
    </section>
  )
}
