export type EveeVoiceMessage = {
  role: "user" | "assistant"
  content: string
}

const VOICE_LENSES = [
  {
    id: "curious-spark",
    direction:
      "Use playful curiosity. Notice the social subtext and respond like it genuinely caught your attention.",
  },
  {
    id: "dry-wit",
    direction:
      "Use understated dry wit. Keep the humor quick and let the funniest phrase land without explaining it.",
  },
  {
    id: "warm-conspirator",
    direction:
      "Sound like a warm co-conspirator sharing what you know while keeping Yugesh's private life private.",
  },
  {
    id: "quick-improv",
    direction:
      "Improvise around the user's exact wording. Use a lively turn of phrase that has not appeared earlier.",
  },
  {
    id: "gentle-mischief",
    direction:
      "Use gentle mischief and a little charm, while staying kind and never making a private detail up.",
  },
  {
    id: "straight-faced-charm",
    direction:
      "Use straight-faced charm. Be concise, conversational, and unexpectedly specific in the phrasing.",
  },
] as const

function normalizeQuestion(text: string) {
  return text
    .normalize("NFKC")
    .toLocaleLowerCase("en-US")
    .replace(/[\p{P}\p{S}]+/gu, " ")
    .replace(/\s+/gu, " ")
    .trim()
}

function compactReply(text: string) {
  const compact = text.replace(/\s+/gu, " ").trim()
  return compact.length <= 280 ? compact : `${compact.slice(0, 277)}...`
}

export function getEveeVoiceContext(messages: EveeVoiceMessage[]) {
  const assistantReplies = messages.filter(
    (message) => message.role === "assistant"
  )
  const userQuestions = messages.filter((message) => message.role === "user")
  const currentQuestion = userQuestions.at(-1)
  const normalizedCurrentQuestion = currentQuestion
    ? normalizeQuestion(currentQuestion.content)
    : ""
  const repeatedQuestion = userQuestions
    .slice(0, -1)
    .some(
      (message) =>
        normalizeQuestion(message.content) === normalizedCurrentQuestion
    )
  const lens = VOICE_LENSES[assistantReplies.length % VOICE_LENSES.length]

  return {
    lensId: lens.id,
    lensDirection: lens.direction,
    repeatedQuestion,
    repliesToAvoid: assistantReplies
      .slice(-3)
      .map((message) => compactReply(message.content)),
  }
}
