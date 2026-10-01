export const HOME_INTRO_SESSION_KEY = "home-intro-started"

/**
 * Runs inline before the first paint. On the session's first page load, when
 * that page is the home page, it sets html[data-home-intro="play"] so the
 * splash is up from the first frame and its CSS animations start there. It
 * skips visitors who prefer reduced motion.
 */
export const HOME_INTRO_SCRIPT = `(function(){try{var d=document.documentElement,k=${JSON.stringify(HOME_INTRO_SESSION_KEY)};if(location.pathname==="/"&&sessionStorage.getItem(k)!=="true"&&!matchMedia("(prefers-reduced-motion: reduce)").matches){d.dataset.homeIntro="play"}sessionStorage.setItem(k,"true")}catch(e){}})()`

export type IntroMode = "pending" | "play" | "skip"
export type IntroPhase = "greetings" | "identity" | "morphing"

type ElementRect = {
  x: number
  y: number
  width: number
  height: number
}

/** If hydration already took this long, skip the splash instead of covering a loaded page. */
export const SLOW_INTRO_LOAD_MS = 350

export function resolveHomeIntroMode(
  hasStartedInMemory: boolean,
  storageValue: string | null,
  loadElapsedMs = 0
): "skip" | "play" {
  if (hasStartedInMemory || storageValue === "true") {
    return "skip"
  }

  if (loadElapsedMs > SLOW_INTRO_LOAD_MS) {
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

/**
 * When each greeting fades in and out, in ms from the first paint. Each one
 * fades in as the one before it fades out, and the identity line fades in as
 * the last greeting leaves.
 */
export function getIntroTimeline(
  greetingCount: number,
  firstHoldMs: number,
  holdMs: number,
  fadeMs: number
): { greetings: { inMs: number; outMs: number }[]; identityMs: number } {
  const greetings: { inMs: number; outMs: number }[] = []
  let atMs = 0

  for (let index = 0; index < greetingCount; index++) {
    const outMs = atMs + fadeMs + (index === 0 ? firstHoldMs : holdMs)
    greetings.push({ inMs: atMs, outMs })
    atMs = outMs
  }

  return { greetings, identityMs: atMs }
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
