export const HOME_INTRO_SESSION_KEY = "home-intro-started"

export type IntroMode = "pending" | "play" | "skip"
export type IntroPhase = "greetings" | "identity" | "morphing"

type ElementRect = {
  x: number
  y: number
  width: number
  height: number
}

export function resolveHomeIntroMode(
  hasStartedInMemory: boolean,
  storageValue: string | null
): "skip" | "play" {
  if (hasStartedInMemory || storageValue === "true") {
    return "skip"
  }

  return "play"
}

export function readHomeIntroStorage(
  getItem: (key: string) => string | null
): string | null {
  try {
    return getItem(HOME_INTRO_SESSION_KEY)
  } catch {
    return null
  }
}

export function writeHomeIntroStorage(
  setItem: (key: string, value: string) => void
): void {
  try {
    setItem(HOME_INTRO_SESSION_KEY, "true")
  } catch {
    // In-memory flag still prevents repeats during client navigation.
  }
}

export function getIntroScheduleMs(
  greetingCount: number,
  stepMs: number,
  identityHoldMs: number
): {
  greetingSwitchAtMs: number[]
  identityAtMs: number
  profileAtMs: number
} {
  const greetingSwitchAtMs = Array.from(
    { length: Math.max(greetingCount - 1, 0) },
    (_, index) => (index + 1) * stepMs
  )
  const identityAtMs = greetingCount * stepMs

  return {
    greetingSwitchAtMs,
    identityAtMs,
    profileAtMs: identityAtMs + identityHoldMs,
  }
}

export function splitDisplayName(
  displayName: string,
  firstName: string
): { first: string; remainder: string } {
  if (displayName === firstName) {
    return { first: firstName, remainder: "" }
  }

  if (displayName.startsWith(firstName)) {
    return {
      first: firstName,
      remainder: displayName.slice(firstName.length).trim(),
    }
  }

  return { first: displayName, remainder: "" }
}

export function getMorphTransform(
  source: ElementRect,
  target: ElementRect,
  shouldScale: boolean
): { translateX: number; translateY: number; scale: number } {
  const sourceCenterX = source.x + source.width / 2
  const sourceCenterY = source.y + source.height / 2
  const targetCenterX = target.x + target.width / 2
  const targetCenterY = target.y + target.height / 2

  return {
    translateX: targetCenterX - sourceCenterX,
    translateY: targetCenterY - sourceCenterY,
    scale: shouldScale && source.width > 0 ? target.width / source.width : 1,
  }
}

export function getIntroPresentationState(
  mode: IntroMode,
  phase: IntroPhase,
  hasMorphFinished: boolean,
  isIntroComplete: boolean,
  shouldReduceMotion: boolean
): {
  showBackdrop: boolean
  showGreeting: boolean
  showIdentity: boolean
  showMorphTargets: boolean
  elevateMorphTargets: boolean
  detailsVisible: boolean
  shouldLockScroll: boolean
} {
  const shouldPlayIntro = mode === "play" && !shouldReduceMotion

  if (!shouldPlayIntro) {
    return {
      showBackdrop: false,
      showGreeting: false,
      showIdentity: false,
      showMorphTargets: true,
      elevateMorphTargets: false,
      detailsVisible: true,
      shouldLockScroll: mode === "pending",
    }
  }

  const isMorphing = phase === "morphing"

  return {
    showBackdrop: !isIntroComplete,
    showGreeting: phase === "greetings",
    showIdentity: phase === "identity" || (isMorphing && !hasMorphFinished),
    showMorphTargets: isMorphing && hasMorphFinished,
    elevateMorphTargets: isMorphing && hasMorphFinished && !isIntroComplete,
    detailsVisible: isMorphing,
    shouldLockScroll: !isIntroComplete,
  }
}
