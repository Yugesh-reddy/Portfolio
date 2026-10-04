export const HOME_INTRO_SESSION_KEY = "home-intro-started"

/** If the page still hasn't hydrated this long after it loads, drop the splash. */
export const HOME_INTRO_FAILSAFE_MS = 6000

/**
 * Runs inline before the first paint. On the session's first page load, when
 * that page is the home page, it sets html[data-home-intro="play"] so the
 * splash is up from the first frame and its CSS animations start there. It
 * skips visitors who prefer reduced motion or arrive at a section link, and
 * clears the splash if the page never hydrates.
 */
export const HOME_INTRO_SCRIPT = `(function(){try{var d=document.documentElement,k=${JSON.stringify(HOME_INTRO_SESSION_KEY)};if(location.pathname==="/"&&!location.hash&&sessionStorage.getItem(k)!=="true"&&!matchMedia("(prefers-reduced-motion: reduce)").matches){d.dataset.homeIntro="play";setTimeout(function(){if(d.dataset.homeIntro==="play")d.dataset.homeIntro="done"},${HOME_INTRO_FAILSAFE_MS})}sessionStorage.setItem(k,"true")}catch(e){}})()`

type ElementRect = {
  x: number
  y: number
  width: number
  height: number
}

/**
 * When each greeting fades in and out, in ms from the first paint. Each one
 * fades in as the one before it fades out. The identity line is laid out
 * differently, so it waits until the last greeting has gone.
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

  return { greetings, identityMs: atMs + fadeMs }
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
