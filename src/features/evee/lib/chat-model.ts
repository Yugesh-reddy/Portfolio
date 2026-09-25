import { ThinkingLevel } from "@google/genai"

export const EVEE_MODEL = "gemini-3.5-flash-lite" as const

export const EVEE_GENERATION_CONFIG = {
  maxOutputTokens: 500,
  temperature: 0.7,
  topP: 0.9,
  thinkingConfig: {
    thinkingLevel: ThinkingLevel.MINIMAL,
  },
} as const
