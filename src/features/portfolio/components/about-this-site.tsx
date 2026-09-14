import Link from "next/link"

import { SOURCE_CODE_GITHUB_URL } from "@/config/site"
import { Icons } from "@/components/icons"
import { PixelMark } from "@/components/pixel-mark"
import { SeparatorHatch as Separator } from "@/components/separator-hatch"
import { SOCIAL_LINKS } from "@/features/portfolio/data/social-links"

import { dependencies, devDependencies } from "../../../../package.json"

const inspirations = [
  { name: "Chanh Dai", href: "https://chanhdai.com" },
  { name: "Emil Kowalski", href: "https://emilkowal.ski" },
  { name: "Rauno Freiberg", href: "https://rauno.me" },
  { name: "shadcn/ui", href: "https://ui.shadcn.com" },
]

const stack = [
  { name: "next", version: dependencies.next },
  { name: "react", version: dependencies.react },
  { name: "tailwindcss", version: devDependencies.tailwindcss },
]

const socials = [
  { title: "LinkedIn", icon: Icons.linkedin },
  { title: "X", icon: Icons.x },
  { title: "GitHub", icon: Icons.github },
].flatMap((social) => {
  const link = SOCIAL_LINKS.find(({ title }) => title === social.title)
  return link ? [{ ...social, href: link.href }] : []
})

const labelClassName =
  "font-mono text-[11px] leading-4 tracking-wider text-muted-foreground uppercase"
const linkClassName =
  "link-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"

export function AboutThisSite() {
  return (
    <>
      <Separator className="screen-line-bottom" />
      <section
        aria-labelledby="about-this-site-title"
        className="screen-line-top screen-line-bottom border-x border-line"
      >
        <h2
          id="about-this-site-title"
          className="border-b border-line px-4 py-3 text-sm font-medium"
        >
          About this site
        </h2>

        <div className="grid grid-cols-2 gap-px border-b border-line bg-line md:grid-cols-3">
          <dl className="min-w-0 bg-background p-4">
            <dt className={labelClassName}>Deployed on</dt>
            <dd className="mt-2 font-mono text-sm">
              <a
                href="https://vercel.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`${linkClassName} inline-flex items-center gap-2`}
              >
                <Icons.vercel className="size-3" />
                Vercel
              </a>
            </dd>
          </dl>
          <dl className="min-w-0 bg-background p-4">
            <dt className={labelClassName}>Source code</dt>
            <dd className="mt-2 font-mono text-sm">
              <a
                href={SOURCE_CODE_GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClassName}
              >
                GitHub
              </a>
            </dd>
          </dl>
          <dl className="col-span-2 min-w-0 bg-background p-4 md:col-span-1">
            <dt className={labelClassName}>Typeface</dt>
            <dd className="mt-2 font-mono text-sm leading-6">
              <a
                href="https://vercel.com/font"
                target="_blank"
                rel="noopener noreferrer"
                className={linkClassName}
              >
                Geist
              </a>
              <span className="block text-xs text-muted-foreground">
                Sans & Mono
              </span>
            </dd>
          </dl>
          <dl className="col-span-2 bg-background p-4 md:col-span-3">
            <dt className={labelClassName}>Stack</dt>
            <dd className="mt-2 flex flex-wrap gap-x-6 gap-y-1 font-mono text-sm leading-6">
              {stack.map(({ name, version }) => (
                <span key={name}>
                  {name}
                  <span className="text-muted-foreground">
                    @{version.replace(/^[~^]/, "")}
                  </span>
                </span>
              ))}
            </dd>
          </dl>
        </div>

        <div className="border-b border-line p-4">
          <h3 className={labelClassName}>Inspired by</h3>
          <ol className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 md:grid-cols-4">
            {inspirations.map(({ name, href }, index) => (
              <li key={name} className="flex items-baseline gap-2 text-sm">
                <span aria-hidden className="font-mono text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
                >
                  {name}
                </a>
              </li>
            ))}
          </ol>
        </div>

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
      </section>
    </>
  )
}
