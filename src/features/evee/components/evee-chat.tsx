"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { ArrowUpIcon, RotateCcwIcon, SparklesIcon } from "lucide-react"
import ReactMarkdown from "react-markdown"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import { EveeAvatar } from "./evee-avatar"

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
}

const SUGGESTED_QUESTIONS = [
  "What is Yugesh's research on AI safety?",
  "Tell me about MediCS & code-switching",
  "What did Yugesh build at UI Health?",
  "Where did Yugesh study & what is his GPA?",
  "What are Yugesh's key technical skills?",
]

export function EveeChat({
  initialQuery = "",
  className,
  onBack,
}: {
  initialQuery?: string
  className?: string
  onBack?: () => void
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const hasTriggeredInitial = useRef(false)

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const sendMessage = useCallback(
    async (textToSend: string) => {
      const trimmed = textToSend.trim()
      if (!trimmed || isLoading) return

      setError(null)
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmed,
      }

      const newMessages = [...messages, userMsg]
      setMessages(newMessages)
      setInput("")
      setIsLoading(true)

      const assistantMsgId = `assistant-${Date.now()}`
      setMessages((prev) => [
        ...prev,
        { id: assistantMsgId, role: "assistant", content: "" },
      ])

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: newMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        })

        if (!response.ok) {
          const errData = (await response.json().catch(() => ({}))) as {
            error?: string
          }
          throw new Error(errData.error || `HTTP error ${response.status}`)
        }

        if (!response.body) {
          throw new Error("No response body received")
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let accumulated = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          accumulated += chunk

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId ? { ...msg, content: accumulated } : msg
            )
          )
        }
      } catch (err: unknown) {
        console.error("Failed to send message:", err)
        const errMsg =
          err instanceof Error ? err.message : "Something went wrong"
        setError(errMsg)
        setMessages((prev) => prev.filter((msg) => msg.id !== assistantMsgId))
      } finally {
        setIsLoading(false)
        textareaRef.current?.focus()
      }
    },
    [messages, isLoading]
  )

  // Trigger initial query if passed
  useEffect(() => {
    if (initialQuery && !hasTriggeredInitial.current) {
      hasTriggeredInitial.current = true
      sendMessage(initialQuery)
    }
  }, [initialQuery, sendMessage])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const clearChat = () => {
    setMessages([])
    setError(null)
    setInput("")
    textareaRef.current?.focus()
  }

  return (
    <div
      className={cn(
        "flex h-[420px] max-h-[70vh] flex-col overflow-hidden bg-background text-foreground",
        className
      )}
    >
      {/* Top action bar */}
      <div className="flex items-center justify-between border-b border-border/60 px-3 py-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5 font-medium">
          <EveeAvatar size="sm" />
          <span className="text-foreground">Evee</span>
          <span className="text-[11px] opacity-75">
            · Yugesh&apos;s AI Guide
          </span>
        </div>

        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="h-6 gap-1 px-2 text-xs hover:text-foreground"
            >
              <RotateCcwIcon className="size-3" />
              Clear
            </Button>
          )}
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-6 px-2 text-xs hover:text-foreground"
            >
              Back to Menu
            </Button>
          )}
        </div>
      </div>

      {/* Messages stream / Empty state */}
      <div className="flex-1 space-y-4 overflow-y-auto p-3.5">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <EveeAvatar size="lg" className="mb-3" />
            <h3 className="text-sm font-semibold text-foreground">
              Ask Evee about Yugesh
            </h3>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              I can answer questions about his AI safety research, projects like
              MediCS, education at UIC, and skills.
            </p>

            <div className="mt-4 flex max-w-md flex-wrap justify-center gap-1.5">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => sendMessage(q)}
                  className="rounded-lg border border-border/70 bg-muted/40 px-2.5 py-1 text-left text-xs text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground active:scale-[0.98]"
                >
                  <SparklesIcon className="mr-1 inline-block size-3 text-amber-500/80" />
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex items-start gap-2.5 text-xs sm:text-sm",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === "assistant" && (
                <EveeAvatar size="sm" className="mt-0.5" />
              )}

              <div
                className={cn(
                  "max-w-[85%] rounded-xl px-3 py-2 text-left leading-relaxed",
                  msg.role === "user"
                    ? "bg-primary font-medium text-primary-foreground"
                    : "border border-border/50 bg-muted/60 text-foreground"
                )}
              >
                {msg.role === "assistant" ? (
                  msg.content ? (
                    <div className="prose-xs prose max-w-none space-y-1.5 break-words sm:prose-sm dark:prose-invert [&_a]:text-primary [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-4 [&_p]:my-1 [&_ul]:list-disc [&_ul]:pl-4">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 py-0.5 text-muted-foreground">
                      <span className="inline-block size-1.5 animate-pulse rounded-full bg-primary" />
                      <span className="inline-block size-1.5 animate-pulse rounded-full bg-primary [animation-delay:200ms]" />
                      <span className="inline-block size-1.5 animate-pulse rounded-full bg-primary [animation-delay:400ms]" />
                    </div>
                  )
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))
        )}

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
            <p className="font-medium">Failed to get response: {error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input section */}
      <div className="border-t border-border/60 bg-background p-2.5">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage(input)
          }}
          className="flex items-center gap-1.5 rounded-xl border border-border bg-muted/30 px-3 py-1.5 ring-1 ring-transparent transition-all focus-within:border-primary focus-within:ring-ring"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Evee anything about Yugesh…"
            rows={1}
            disabled={isLoading}
            className="max-h-24 flex-1 resize-none overflow-y-auto bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden disabled:opacity-50 sm:text-sm"
          />

          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="size-7 shrink-0 rounded-lg transition-transform active:scale-95"
            aria-label="Send message"
          >
            <ArrowUpIcon className="size-3.5" />
          </Button>
        </form>
      </div>
    </div>
  )
}
