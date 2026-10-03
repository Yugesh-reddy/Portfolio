import { IntroProfile } from "./intro-profile"

/**
 * The home intro. Whether it plays is decided before the first paint by
 * HOME_INTRO_SCRIPT in the app layout, not here, so it never covers a page that
 * has already been on screen.
 */
export function IntroSection() {
  return <IntroProfile />
}
