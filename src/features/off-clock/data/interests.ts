type PersonalFeature = {
  title: string
  note: string
  /** Use a user-provided local asset in public/. */
  image?: `/${string}`
  imageAlt?: string
  href?: `https://${string}`
}

type Interests = {
  watching: { feature: PersonalFeature | null }
  chicago: { feature: PersonalFeature | null }
}

// Add a real title/place here when selected. The fallbacks reflect only the
// interests Yugesh has shared; they do not invent current viewing or visits.
export const INTERESTS: Interests = {
  watching: { feature: null },
  chicago: { feature: null },
}
