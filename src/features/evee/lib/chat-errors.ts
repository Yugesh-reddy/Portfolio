export type PublicChatError = {
  status: number
  message: string
}

function getErrorText(error: unknown) {
  if (typeof error === "string") return error
  if (error instanceof Error) return `${error.name} ${error.message}`

  try {
    return JSON.stringify(error)
  } catch {
    return ""
  }
}

export function getPublicChatError(error: unknown): PublicChatError {
  const message = getErrorText(error).toLowerCase()

  if (message.includes("aborterror") || message.includes("aborted")) {
    return {
      status: 504,
      message: "Evee took too long to respond. Please try again.",
    }
  }

  if (
    message.includes("429") ||
    message.includes("resource_exhausted") ||
    message.includes("rate limit") ||
    message.includes("quota")
  ) {
    return {
      status: 429,
      message:
        "Evee is handling a lot of questions right now. Try again shortly.",
    }
  }

  return {
    status: 503,
    message: "Evee is unavailable right now. Please try again later.",
  }
}
