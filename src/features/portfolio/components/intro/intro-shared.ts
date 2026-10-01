export const GREETINGS = [
  "Hello",
  "Bonjour",
  "स्वागत है",
  "Ciao",
  "Hallå",
] as const

/** Each greeting fades in while the one before it fades out. */
export const GREETING_FADE_MS = 70
/** "Hello" stays a little longer so the sequence reads as a greeting. */
export const FIRST_GREETING_HOLD_MS = 260
export const GREETING_HOLD_MS = 90
export const IDENTITY_FADE_MS = 200
export const GREETING_DURATION_MS = 120
export const IDENTITY_HOLD_MS = 420
export const PROFILE_LAYOUT_DURATION_MS = 520
export const CURTAIN_DELAY_MS = 400
export const CURTAIN_DURATION_MS = 240
export const DETAIL_DELAY_MS = 360
export const DETAIL_DURATION_MS = 160
export const ROLE_STAGGER_MS = 60
export const IDENTITY_AVATAR_SIZE = 38
export const GREETING_EASING = "cubic-bezier(0.33, 1, 0.68, 1)"
export const PROFILE_LAYOUT_EASING = "cubic-bezier(0.77, 0, 0.175, 1)"
export const CURTAIN_EASING = "cubic-bezier(0.23, 1, 0.32, 1)"
export const DETAIL_EASING = "cubic-bezier(0.23, 1, 0.32, 1)"
export const PROFILE_NAME_CLASS = "text-[2rem]/none font-medium tracking-tight"
