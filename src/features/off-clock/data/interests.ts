type PersonalFeature = {
  title: string
  note?: string
  /** Local artwork in public/. Record sourced artwork in the content guide. */
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
  watching: {
    feature: {
      title: "House of the Dragon",
      note: "Season 3",
      image: "/images/watching/house-of-the-dragon-season-3-ensemble.webp",
      imageAlt:
        "House of the Dragon Season 3 ensemble poster: Rhaenyra and the cast gathered around the Iron Throne",
      href: "https://www.hbo.com/house-of-the-dragon",
    },
  },
  chicago: { feature: null },
}
