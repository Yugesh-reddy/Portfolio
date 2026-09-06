import { Icons } from "@/components/icons"
import type { SocialLink } from "@/features/portfolio/types/social-links-v2"

export const SOCIAL_LINKS: SocialLink[] = [
  {
    name: "x",
    icon: <Icons.x />,
    title: "X",
    handle: "Yugeshsapp",
    href: "https://x.com/Yugeshsapp",
  },
  {
    name: "github",
    icon: <Icons.github />,
    title: "GitHub",
    handle: "Yugesh-reddy",
    href: "https://github.com/Yugesh-reddy",
  },
  {
    name: "linkedin",
    icon: <Icons.linkedin />,
    title: "LinkedIn",
    handle: "yugesh-reddy-sappidi",
    href: "https://www.linkedin.com/in/yugesh-reddy-sappidi",
  },
  {
    name: "youtube",
    icon: <Icons.youtube />,
    title: "YouTube",
    handle: "yugeshreddys9973",
    href: "https://www.youtube.com/@yugeshreddys9973",
  },
  {
    // No `href`: Discord profile links resolve by numeric user ID, not by
    // username, so the handle is click-to-copy instead of a dead link.
    name: "discord",
    icon: <Icons.discord />,
    title: "Discord",
    handle: "pain0._.0",
  },
]

export function getSocialLinkByName(name: string) {
  return SOCIAL_LINKS.find((link) => link.name === name)
}
