import { MAX_REQUEST_MESSAGES } from "./chat-limits.js"

export { MAX_REQUEST_MESSAGES } from "./chat-limits.js"

export type ChatRole = "user" | "assistant"

export type ChatMessage = {
  id: string
  role: ChatRole
  content: string
}

export type RequestMessage = Pick<ChatMessage, "role" | "content">

type PendingTurnIds = {
  userMessageId: string
  assistantMessageId: string
  replaceUserMessageId?: string
}

function toRequestMessages(messages: ChatMessage[]): RequestMessage[] {
  const populatedMessages = messages
    .filter((message) => message.content.trim().length > 0)
    .map(({ role, content }) => ({ role, content: content.trim() }))

  const recentMessages = populatedMessages.slice(-MAX_REQUEST_MESSAGES)

  while (recentMessages[0]?.role === "assistant") {
    recentMessages.shift()
  }

  return recentMessages
}

export function createPendingTurn(
  messages: ChatMessage[],
  text: string,
  ids: PendingTurnIds
) {
  const baseMessages = ids.replaceUserMessageId
    ? messages.filter((message) => message.id !== ids.replaceUserMessageId)
    : messages
  const previousMessages =
    !ids.replaceUserMessageId && baseMessages.at(-1)?.role === "user"
      ? baseMessages.slice(0, -1)
      : baseMessages

  const userMessage: ChatMessage = {
    id: ids.userMessageId,
    role: "user",
    content: text.trim(),
  }
  const assistantMessage: ChatMessage = {
    id: ids.assistantMessageId,
    role: "assistant",
    content: "",
  }

  return {
    messages: [...previousMessages, userMessage, assistantMessage],
    requestMessages: toRequestMessages([...previousMessages, userMessage]),
  }
}

export function appendAssistantChunk(
  messages: ChatMessage[],
  assistantMessageId: string,
  chunk: string
) {
  return messages.map((message) =>
    message.id === assistantMessageId
      ? { ...message, content: message.content + chunk }
      : message
  )
}
