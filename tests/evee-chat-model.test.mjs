import assert from "node:assert/strict"
import test from "node:test"

import {
  EVEE_GENERATION_CONFIG,
  EVEE_MODEL,
} from "../src/features/evee/lib/chat-model.ts"

test("uses the deployment-proven low-latency Gemini configuration", () => {
  assert.equal(EVEE_MODEL, "gemini-2.5-flash")
  assert.equal(EVEE_GENERATION_CONFIG.thinkingConfig.thinkingBudget, 0)
  assert.equal(EVEE_GENERATION_CONFIG.maxOutputTokens, 500)
})
