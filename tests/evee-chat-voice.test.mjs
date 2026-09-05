import assert from "node:assert/strict"
import test from "node:test"

import { EVEE_GENERATION_CONFIG } from "../src/features/evee/lib/chat-model.ts"

const voiceModulePath = new URL(
  "../src/features/evee/lib/chat-voice.ts",
  import.meta.url
)

test("recognizes a repeated question despite casing, spacing, or punctuation", async () => {
  const { getEveeVoiceContext } = await import(voiceModulePath.href)

  const firstTurn = getEveeVoiceContext([
    { role: "user", content: "Is he single?" },
  ])
  const repeatedTurn = getEveeVoiceContext([
    { role: "user", content: "Is he single?" },
    {
      role: "assistant",
      content: "That mystery belongs to Yugesh. You will have to ask him.",
    },
    { role: "user", content: "  IS he single ?  " },
  ])

  assert.equal(firstTurn.repeatedQuestion, false)
  assert.equal(repeatedTurn.repeatedQuestion, true)
  assert.notEqual(repeatedTurn.lensId, firstTurn.lensId)
})

test("rotates conversational lenses instead of settling into one reply pattern", async () => {
  const { getEveeVoiceContext } = await import(voiceModulePath.href)

  const lenses = Array.from({ length: 5 }, (_, assistantCount) => {
    const messages = []

    for (let index = 0; index < assistantCount; index += 1) {
      messages.push(
        { role: "user", content: `Question ${index}` },
        { role: "assistant", content: `Answer ${index}` }
      )
    }

    messages.push({ role: "user", content: "Tell me something" })
    return getEveeVoiceContext(messages).lensId
  })

  assert.equal(new Set(lenses).size, 5)
})

test("gives the model recent replies to avoid echoing", async () => {
  const { getEveeVoiceContext } = await import(voiceModulePath.href)

  const context = getEveeVoiceContext([
    { role: "user", content: "Is he free?" },
    { role: "assistant", content: "Free for coffee or free for a project?" },
    { role: "user", content: "What are his hobbies?" },
    {
      role: "assistant",
      content: "The off-duty lore is missing from my notes.",
    },
    { role: "user", content: "Is he free?" },
  ])

  assert.deepEqual(context.repliesToAvoid, [
    "Free for coffee or free for a project?",
    "The off-duty lore is missing from my notes.",
  ])
  assert.equal(context.repeatedQuestion, true)
})

test("uses a varied but bounded Gemini sampling profile", () => {
  assert.ok(EVEE_GENERATION_CONFIG.temperature >= 0.6)
  assert.ok(EVEE_GENERATION_CONFIG.temperature <= 0.8)
  assert.ok(EVEE_GENERATION_CONFIG.topP >= 0.85)
  assert.ok(EVEE_GENERATION_CONFIG.topP <= 0.95)
})
