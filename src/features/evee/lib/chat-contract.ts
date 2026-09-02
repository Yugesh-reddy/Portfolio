import { z } from "zod"

import {
  MAX_ASSISTANT_MESSAGE_LENGTH,
  MAX_MESSAGE_LENGTH,
  MAX_REQUEST_MESSAGES,
} from "./chat-limits.js"

export {
  MAX_ASSISTANT_MESSAGE_LENGTH,
  MAX_MESSAGE_LENGTH,
  MAX_REQUEST_MESSAGES,
} from "./chat-limits.js"

const userMessageSchema = z
  .object({
    role: z.literal("user"),
    content: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
  })
  .strict()

const assistantMessageSchema = z
  .object({
    role: z.literal("assistant"),
    content: z.string().trim().min(1).max(MAX_ASSISTANT_MESSAGE_LENGTH),
  })
  .strict()

const chatMessageSchema = z.discriminatedUnion("role", [
  userMessageSchema,
  assistantMessageSchema,
])

const chatRequestSchema = z
  .object({
    messages: z.array(chatMessageSchema).min(1).max(MAX_REQUEST_MESSAGES),
  })
  .strict()
  .superRefine(({ messages }, context) => {
    if (messages[0]?.role !== "user") {
      context.addIssue({
        code: "custom",
        message: "The conversation must start with a user message.",
        path: ["messages", 0, "role"],
      })
    }

    if (messages.at(-1)?.role !== "user") {
      context.addIssue({
        code: "custom",
        message: "The conversation must end with a user message.",
        path: ["messages", messages.length - 1, "role"],
      })
    }

    for (let index = 1; index < messages.length; index += 1) {
      if (messages[index].role === messages[index - 1].role) {
        context.addIssue({
          code: "custom",
          message: "Conversation roles must alternate.",
          path: ["messages", index, "role"],
        })
      }
    }
  })

export type ChatRequest = z.infer<typeof chatRequestSchema>

export function parseChatRequest(input: unknown) {
  return chatRequestSchema.safeParse(input)
}
