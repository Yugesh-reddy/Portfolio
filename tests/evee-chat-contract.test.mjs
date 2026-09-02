import assert from "node:assert/strict"
import test from "node:test"

const modulePath = new URL(
  "../src/features/evee/lib/chat-contract.ts",
  import.meta.url
)

test("normalizes a valid alternating conversation", async () => {
  const { parseChatRequest } = await import(modulePath.href)

  const result = parseChatRequest({
    messages: [
      { role: "user", content: "  Give me the short version.  " },
      { role: "assistant", content: "Yugesh is an AI engineer." },
      { role: "user", content: "What is his strongest evidence?" },
    ],
  })

  assert.equal(result.success, true)
  assert.deepEqual(result.data.messages[0], {
    role: "user",
    content: "Give me the short version.",
  })
})

test("accepts a follow-up after an assistant answer longer than the user limit", async () => {
  const { parseChatRequest } = await import(modulePath.href)

  const result = parseChatRequest({
    messages: [
      { role: "user", content: "Tell me about Yugesh's research." },
      { role: "assistant", content: "Evidence. ".repeat(120) },
      { role: "user", content: "What did he build next?" },
    ],
  })

  assert.equal(result.success, true)
})

test("rejects malformed, oversized, and non-alternating conversations", async () => {
  const { MAX_MESSAGE_LENGTH, parseChatRequest } = await import(modulePath.href)
  const invalidPayloads = [
    null,
    { messages: [] },
    { messages: [{ role: "user", content: "" }] },
    {
      messages: [{ role: "user", content: "x".repeat(MAX_MESSAGE_LENGTH + 1) }],
    },
    {
      messages: [
        { role: "user", content: "First" },
        { role: "user", content: "Second" },
      ],
    },
    {
      messages: [
        { role: "user", content: "Question" },
        { role: "assistant", content: "Answer" },
      ],
    },
    { messages: [{ role: "user", content: "Question", hidden: true }] },
  ]

  for (const payload of invalidPayloads) {
    assert.equal(parseChatRequest(payload).success, false)
  }
})

test("rejects conversations beyond the server history limit", async () => {
  const { MAX_REQUEST_MESSAGES, parseChatRequest } = await import(
    modulePath.href
  )
  const messages = Array.from(
    { length: MAX_REQUEST_MESSAGES + 1 },
    (_, index) => ({
      role: index % 2 === 0 ? "user" : "assistant",
      content: `Message ${index}`,
    })
  )

  assert.equal(parseChatRequest({ messages }).success, false)
})
