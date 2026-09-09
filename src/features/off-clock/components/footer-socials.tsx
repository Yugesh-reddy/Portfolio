import Link from "next/link"

import { Icons } from "@/components/icons"
import { PixelMark } from "@/components/pixel-mark"
import { SOCIAL_LINKS } from "@/features/portfolio/data/social-links"

const socials = [
  { title: "LinkedIn", icon: Icons.linkedin },
  { title: "X", icon: Icons.x },
  { title: "GitHub", icon: Icons.github },
].flatMap((social) => {
  const link = SOCIAL_LINKS.find(({ title }) => title === social.title)
  return link ? [{ ...social, href: link.href }] : []
})

export function FooterSocials() {
  return (
    <>
      <div aria-hidden className="h-4 border-b border-line" />
      <div className="flex h-12 items-center justify-between border-b border-line px-4 text-muted-foreground">
        <Link
          href="/#top"
          aria-label="Yugesh Sappidi, back to top"
          className="flex min-h-10 items-center hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
        >
          <PixelMark className="h-5 w-auto" />
        </Link>
        <nav aria-label="Footer social links">
          <ul className="flex items-center">
            {socials.map(({ title, href, icon: Icon }, index) => (
              <li key={title} className="flex items-center">
                {index > 0 && (
                  <span aria-hidden className="h-4 w-px bg-border" />
                )}
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${title} (opens in a new tab)`}
                  className="flex size-10 items-center justify-center transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring motion-reduce:transition-none"
                >
                  <Icon className="size-4" />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  )
}
