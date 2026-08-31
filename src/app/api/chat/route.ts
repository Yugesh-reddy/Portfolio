import { GoogleGenAI } from "@google/genai"

import { EVEE_SYSTEM_PROMPT } from "@/features/evee/prompts/system-prompt"

export const runtime = "nodejs"

type Message = {
  role: "user" | "assistant"
  content: string
}

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as { messages: Message[] }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages array is required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GENAI_API_KEY ||
      process.env.GOOGLE_API_KEY

    // If API key is not configured, return a helpful fallback message explaining how to set the key
    if (!apiKey) {
      const lastUserMessage =
        [...messages].reverse().find((m) => m.role === "user")?.content || ""

      const fallbackText = `Hi! I'm **Evee**, Yugesh's AI assistant. 

I'm ready to answer questions about Yugesh's research in **AI Safety**, his projects like **MediCS**, his experience at **UI Health**, and his background!

> [!NOTE]
> To enable live responses powered by Google Gemini, please add \`GEMINI_API_KEY=your_key_here\` to your \`.env.local\` file.

You asked: *"${lastUserMessage}"*

Yugesh is an AI Engineer and Graduate Researcher at the University of Illinois Chicago (MS CS, GPA 4.0/4.0) specializing in adversarial robustness and AI safety. His work explores how modern LLMs fail under adversarial pressure and designs adaptive defense pipelines.`

      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          // Stream the fallback text smoothly
          const words = fallbackText.split(" ")
          for (const word of words) {
            controller.enqueue(encoder.encode(word + " "))
            await new Promise((r) => setTimeout(r, 20))
          }
          controller.close()
        },
      })

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Transfer-Encoding": "chunked",
        },
      })
    }

    const ai = new GoogleGenAI({ apiKey })

    // Format messages for Gemini API
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? ("model" as const) : ("user" as const),
      parts: [{ text: m.content }],
    }))

    const responseStream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: EVEE_SYSTEM_PROMPT,
        temperature: 0.4,
      },
    })

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            const text = chunk.text
            if (text) {
              controller.enqueue(encoder.encode(text))
            }
          }
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    })
  } catch (error: unknown) {
    console.error("Error in Evee chat API:", error)
    const message =
      error instanceof Error ? error.message : "Failed to process chat request"

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
