type PersonalFeature = {
  title: string
  note?: string
  /** Local artwork in public/. Record sourced artwork in the content guide. */
  image?: `/${string}`
  imageAlt?: string
  href?: `https://${string}`
}

/** An instant print. Values come from the photo's EXIF, which is stripped
 * from the published file, so only what is listed here is ever shown. */
type CityPhoto = {
  /** Local 3:4 image in public/, exported without metadata. */
  src: `/${string}`
  alt: string
  /** Handwritten on the print's bottom strip. */
  caption: string
  exposure: {
    /** 35mm-equivalent focal length. */
    focalLength: number
    aperture: number
    shutter: `1/${number}`
    iso: number
  }
}

type CityFeature = {
  /** Names the card for screen readers when it links somewhere. */
  place: string
  href?: `https://${string}`
  photos: CityPhoto[]
}

type Interests = {
  watching: { feature: PersonalFeature | null }
  chicago: { feature: CityFeature | null }
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
  chicago: {
    feature: {
      place: "Tribune Tower",
      photos: [
        {
          src: "/images/chicago/tribune-tower-at-night.webp",
          alt: "Chicago skyline at night from North Michigan Avenue: the floodlit Gothic crown of Tribune Tower beside the Wrigley Building clock tower and Trump Tower",
          caption: "Tribune Tower",
          exposure: {
            focalLength: 24,
            aperture: 1.78,
            shutter: "1/30",
            iso: 1600,
          },
        },
        {
          src: "/images/chicago/museum-of-ice-cream.webp",
          alt: "Lit Museum of Ice Cream banners hanging along the stone facade of Tribune Tower at night",
          caption: "Museum of Ice Cream",
          exposure: {
            focalLength: 48,
            aperture: 1.78,
            shutter: "1/40",
            iso: 200,
          },
        },
      ],
    },
  },
}
