import assert from "node:assert/strict"
import test from "node:test"

const modulePath = new URL(
  "../src/features/evee/lib/chat-state.ts",
  import.meta.url
)

test("retries a failed turn without duplicating the user question", async () => {
  const { createPendingTurn } = await import(modulePath.href)
  const previousMessages = [
    { id: "user-failed", role: "user", content: "What did Yugesh build?" },
  ]

  const turn = createPendingTurn(previousMessages, "What did Yugesh build?", {
    userMessageId: "user-retry",
    assistantMessageId: "assistant-retry",
    replaceUserMessageId: "user-failed",
  })

  assert.equal(
    turn.messages.filter(
      (message) =>
        message.role === "user" && message.content === "What did Yugesh build?"
    ).length,
    1
  )
  assert.deepEqual(turn.requestMessages, [
    { role: "user", content: "What did Yugesh build?" },
  ])
})

test("replaces an unanswered trailing question when the user moves on", async () => {
  const { createPendingTurn } = await import(modulePath.href)
  const previousMessages = [
    { id: "user-answered", role: "user", content: "First question" },
    { id: "assistant-answered", role: "assistant", content: "First answer" },
    { id: "user-stopped", role: "user", content: "Stopped question" },
  ]

  const turn = createPendingTurn(previousMessages, "Different question", {
    userMessageId: "user-next",
    assistantMessageId: "assistant-next",
  })

  assert.deepEqual(turn.requestMessages, [
    { role: "user", content: "First question" },
    { role: "assistant", content: "First answer" },
    { role: "user", content: "Different question" },
  ])
  assert.equal(
    turn.messages.some((message) => message.id === "user-stopped"),
    false
  )
})

test("keeps only the latest complete turns in an API request", async () => {
  const { createPendingTurn, MAX_REQUEST_MESSAGES } = await import(
    modulePath.href
  )
  const previousMessages = Array.from({ length: 14 }, (_, index) => ({
    id: `message-${index}`,
    role: index % 2 === 0 ? "user" : "assistant",
    content: `Message ${index}`,
  }))

  const turn = createPendingTurn(previousMessages, "Latest question", {
    userMessageId: "user-latest",
    assistantMessageId: "assistant-latest",
  })

  assert.ok(turn.requestMessages.length <= MAX_REQUEST_MESSAGES)
  assert.equal(turn.requestMessages[0].role, "user")
  assert.deepEqual(turn.requestMessages.at(-1), {
    role: "user",
    content: "Latest question",
  })
  assert.equal(
    turn.requestMessages.some((message) => message.content === "Message 0"),
    false
  )
})

test("appends streamed text only to the active assistant message", async () => {
  const { appendAssistantChunk } = await import(modulePath.href)
  const messages = [
    { id: "user-1", role: "user", content: "Question" },
    { id: "assistant-1", role: "assistant", content: "Evidence" },
    { id: "assistant-2", role: "assistant", content: "" },
  ]

  assert.deepEqual(appendAssistantChunk(messages, "assistant-2", " first"), [
    messages[0],
    messages[1],
    { id: "assistant-2", role: "assistant", content: " first" },
  ])
})
