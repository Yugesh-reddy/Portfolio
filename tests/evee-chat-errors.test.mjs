import assert from "node:assert/strict"
import test from "node:test"

const modulePath = new URL(
  "../src/features/evee/lib/chat-errors.ts",
  import.meta.url
)

test("maps rate limits to a useful retry message", async () => {
  const { getPublicChatError } = await import(modulePath.href)

  assert.deepEqual(getPublicChatError(new Error("429 RESOURCE_EXHAUSTED")), {
    status: 429,
    message:
      "Evee is handling a lot of questions right now. Try again shortly.",
  })
})

test("does not expose API keys or deployment details", async () => {
  const { getPublicChatError } = await import(modulePath.href)
  const error = getPublicChatError(
    new Error(
      '{"error":{"message":"API key not valid. Please pass a valid API key."}}'
    )
  )

  assert.deepEqual(error, {
    status: 503,
    message: "Evee is unavailable right now. Please try again later.",
  })
  assert.equal(error.message.toLowerCase().includes("api key"), false)
})

test("maps aborted requests to a timeout message", async () => {
  const { getPublicChatError } = await import(modulePath.href)
  const error = new DOMException("The operation was aborted", "AbortError")

  assert.deepEqual(getPublicChatError(error), {
    status: 504,
    message: "Evee took too long to respond. Please try again.",
  })
})
