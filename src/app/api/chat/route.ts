import { GoogleGenAI } from "@google/genai"

import { createRedisCommand } from "@/lib/upstash"
import { parseChatRequest } from "@/features/evee/lib/chat-contract"
import { getPublicChatError } from "@/features/evee/lib/chat-errors"
import {
  EVEE_GENERATION_CONFIG,
  EVEE_MODEL,
} from "@/features/evee/lib/chat-model"
import { createEveeSystemPrompt } from "@/features/evee/prompts/system-prompt"

export const runtime = "nodejs"

const REQUEST_TIMEOUT_MS = 25_000
const RATE_LIMIT_MAX_REQUESTS = 20
const RATE_LIMIT_WINDOW_SECONDS = 600
const RATE_LIMIT_SCRIPT = `
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
end
local ttl = redis.call('TTL', KEYS[1])
return { current, ttl }
`

let cachedClient: { apiKey: string; ai: GoogleGenAI } | null = null

function getGenAIClient(apiKey: string) {
  if (cachedClient?.apiKey === apiKey) return cachedClient.ai
  const ai = new GoogleGenAI({ apiKey })
  cachedClient = { apiKey, ai }
  return ai
}

function getClientIdentifier(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim()
    if (first) return first
  }
  return request.headers.get("x-real-ip")?.trim() || "anonymous"
}

async function checkRateLimit(request: Request): Promise<number | null> {
  const command = createRedisCommand(1500)
  if (!command) return null
  const key = `portfolio:chat:rl:${getClientIdentifier(request)}`
  try {
    const result = await command([
      "EVAL",
      RATE_LIMIT_SCRIPT,
      1,
      key,
      RATE_LIMIT_WINDOW_SECONDS,
    ])
    if (!Array.isArray(result)) return null
    const count = Number(result[0])
    const ttl = Math.max(1, Number(result[1]) || RATE_LIMIT_WINDOW_SECONDS)
    return count > RATE_LIMIT_MAX_REQUESTS ? ttl : null
  } catch {
    // Fail open if Redis is temporarily unreachable.
    return null
  }
}

type GeminiStream = Awaited<
  ReturnType<GoogleGenAI["models"]["generateContentStream"]>
>

function jsonError(
  message: string,
  status: number,
  extraHeaders?: Record<string, string>
) {
  return Response.json(
    { error: message },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        ...extraHeaders,
      },
    }
  )
}

async function findFirstTextChunk(stream: GeminiStream) {
  const iterator = stream[Symbol.asyncIterator]()

  while (true) {
    const result = await iterator.next()
    if (result.done) return null

    const text = result.value.text
    if (text) return { iterator, text }
  }
}

async function startGeminiStream(
  ai: GoogleGenAI,
  contents: Array<{
    role: "user" | "model"
    parts: Array<{ text: string }>
  }>,
  signal: AbortSignal,
  systemInstruction: string
) {
  const stream = await ai.models.generateContentStream({
    model: EVEE_MODEL,
    contents,
    config: {
      ...EVEE_GENERATION_CONFIG,
      abortSignal: signal,
      systemInstruction,
    },
  })
  const startedStream = await findFirstTextChunk(stream)

  if (!startedStream) throw new Error("Gemini returned an empty response.")
  return startedStream
}

export async function POST(request: Request) {
  let requestBody: unknown

  try {
    requestBody = await request.json()
  } catch {
    return jsonError("That question could not be processed.", 400)
  }

  const parsedRequest = parseChatRequest(requestBody)
  if (!parsedRequest.success) {
    return jsonError(
      "That conversation is invalid or too long. Start a new chat and try again.",
      400
    )
  }

  const apiKey =
    process.env.GEMINI_API_KEY ??
    process.env.GOOGLE_GENAI_API_KEY ??
    process.env.GOOGLE_API_KEY

  if (!apiKey?.trim()) {
    console.error("Evee chat is unavailable: no Gemini API key is configured.")
    return jsonError(
      "Evee is unavailable right now. Please try again later.",
      503
    )
  }

  const retryAfter = await checkRateLimit(request)
  if (retryAfter !== null) {
    return jsonError(
      "You are sending messages too quickly. Please wait a bit and try again.",
      429,
      { "Retry-After": String(retryAfter) }
    )
  }

  const signal = AbortSignal.any([
    request.signal,
    AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  ])
  const contents = parsedRequest.data.messages.map((message) => ({
    role: message.role === "assistant" ? ("model" as const) : ("user" as const),
    parts: [{ text: message.content }],
  }))
  const systemInstruction = createEveeSystemPrompt(parsedRequest.data.messages)

  try {
    const ai = getGenAIClient(apiKey.trim())
    const { iterator, text: firstText } = await startGeminiStream(
      ai,
      contents,
      signal,
      systemInstruction
    )
    const encoder = new TextEncoder()

    const responseStream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode(firstText))
      },
      async pull(controller) {
        try {
          const result = await iterator.next()

          if (result.done) {
            controller.close()
            return
          }

          const chunk = result.value.text
          if (chunk) controller.enqueue(encoder.encode(chunk))
        } catch (error) {
          controller.error(error)
        }
      },
      async cancel() {
        await iterator.return?.(undefined)
      },
    })

    return new Response(responseStream, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (error) {
    console.error("Evee chat request failed.", error)
    const publicError = getPublicChatError(error)
    return jsonError(publicError.message, publicError.status)
  }
}
