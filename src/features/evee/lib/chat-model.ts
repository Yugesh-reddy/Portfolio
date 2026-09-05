export const EVEE_MODEL = "gemini-2.5-flash" as const

export const EVEE_GENERATION_CONFIG = {
  maxOutputTokens: 500,
  temperature: 0.7,
  topP: 0.9,
  thinkingConfig: {
    thinkingBudget: 0,
  },
} as const
