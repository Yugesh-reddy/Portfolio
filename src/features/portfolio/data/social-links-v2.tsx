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
    name: "discord",
    icon: <Icons.discord />,
    title: "Discord",
    // TODO: replace with your Discord profile/invite URL
    handle: "",
    href: "#",
  },
  {
    name: "youtube",
    icon: <Icons.youtube />,
    title: "YouTube",
    // TODO: replace with your YouTube channel URL
    handle: "",
    href: "#",
  },
]

export function getSocialLinkByName(name: string) {
  return SOCIAL_LINKS.find((link) => link.name === name)
}
