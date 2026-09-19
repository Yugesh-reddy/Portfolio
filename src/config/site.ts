import type { NavItem } from "@/types/nav"
import { USER } from "@/features/portfolio/data/user"

export const SITE_INFO = {
  name: USER.displayName,
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: USER.ogImage,
  ogImageLight: USER.ogImageLight,
  description: USER.bio,
  keywords: USER.keywords,
}

/** Default link-preview images. Crawlers use the first entry. */
export const SHARE_IMAGES = [
  {
    url: USER.ogImageLight,
    width: 1200,
    height: 630,
    alt: USER.displayName,
  },
  {
    url: USER.ogImage,
    width: 1200,
    height: 630,
    alt: USER.displayName,
  },
] as const

export const META_THEME_COLORS = {
  light: "#ffffff",
  dark: "#09090b",
}

export const MAIN_NAV: NavItem[] = [
  {
    title: "Stats",
    href: "/stats",
  },
  {
    title: "Blog",
    href: "/blog",
  },
  {
    title: "Resume",
    href: "/resume",
  },
]

export const MOBILE_NAV: NavItem[] = [
  {
    title: "Home",
    href: "/",
  },
  ...MAIN_NAV,
]

export const X_HANDLE = "@yugeshreddy"
export const GITHUB_USERNAME = "yugesh-reddy"
export const SOURCE_CODE_GITHUB_REPO = "yugesh-reddy/yugesh-portfolio"
export const SOURCE_CODE_GITHUB_URL =
  "https://github.com/yugesh-reddy/yugesh-portfolio"

export const UTM_PARAMS = {
  utm_source: "yugesh-portfolio",
}
