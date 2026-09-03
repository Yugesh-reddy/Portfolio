import { GoogleGenAI } from "@google/genai"

import { parseChatRequest } from "@/features/evee/lib/chat-contract"
import { getPublicChatError } from "@/features/evee/lib/chat-errors"
import {
  EVEE_GENERATION_CONFIG,
  EVEE_MODEL,
} from "@/features/evee/lib/chat-model"
import { createEveeSystemPrompt } from "@/features/evee/prompts/system-prompt"

export const runtime = "nodejs"

const REQUEST_TIMEOUT_MS = 25_000

type GeminiStream = Awaited<
  ReturnType<GoogleGenAI["models"]["generateContentStream"]>
>

function jsonError(message: string, status: number) {
  return Response.json(
    { error: message },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
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
    const ai = new GoogleGenAI({ apiKey: apiKey.trim() })
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
