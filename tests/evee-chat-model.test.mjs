import assert from "node:assert/strict"
import test from "node:test"

import {
  EVEE_GENERATION_CONFIG,
  EVEE_MODEL,
} from "../src/features/evee/lib/chat-model.ts"

test("uses stable Gemini Flash-Lite with minimal thinking", () => {
  assert.equal(EVEE_MODEL, "gemini-3.5-flash-lite")
  assert.equal(EVEE_GENERATION_CONFIG.thinkingConfig.thinkingLevel, "MINIMAL")
  assert.equal(EVEE_GENERATION_CONFIG.maxOutputTokens, 500)
})
