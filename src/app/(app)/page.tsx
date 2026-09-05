import type { Metadata } from "next"
import type { ProfilePage as PageSchema, WithContext } from "schema-dts"

import { Reveal } from "@/components/motion/reveal"
import { SeparatorHatch as Separator } from "@/components/separator-hatch"
import { About } from "@/features/portfolio/components/about"
import { Blog } from "@/features/portfolio/components/blog"
import { Bookmarks } from "@/features/portfolio/components/bookmarks"
import { Certifications } from "@/features/portfolio/components/certifications"
import { Education } from "@/features/portfolio/components/education"
import { Experiences } from "@/features/portfolio/components/experiences"
import { GitHubContributions } from "@/features/portfolio/components/github-contributions"
import { Insights } from "@/features/portfolio/components/insights"
import { IntroSection } from "@/features/portfolio/components/intro/intro-section"
import { Overview } from "@/features/portfolio/components/overview"
import { Projects } from "@/features/portfolio/components/projects"
import { SocialLinks } from "@/features/portfolio/components/social-links"
import { TechStack } from "@/features/portfolio/components/tech-stack"
import { Testimonials } from "@/features/portfolio/components/testimonials"
import { USER } from "@/features/portfolio/data/user"

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getPageJsonLd()).replace(/</g, "\\u003c"),
        }}
      />

      <div className="mx-auto md:max-w-3xl [&_[id]]:scroll-mt-22">
        <IntroSection />
        <Separator />

        <Reveal delay={0.12}>
          <Overview />
        </Reveal>
        <Reveal delay={0.18}>
          <SocialLinks />
        </Reveal>
        <Separator />

        <Reveal>
          <About />
        </Reveal>

        <Reveal>
          <GitHubContributions />
        </Reveal>
        <Separator />

        <Reveal>
          <TechStack />
        </Reveal>
      </div>

      <div className="mx-auto md:max-w-3xl [&_[id]]:scroll-mt-22">
        <Separator />

        <Reveal>
          <Experiences />
        </Reveal>
        <Separator />

        <Reveal>
          <Projects />
        </Reveal>
        <Separator />

        <Reveal>
          <Education />
        </Reveal>
        <Separator />

        <Reveal>
          <Certifications />
        </Reveal>
        <Separator />

        <Reveal>
          <Blog />
        </Reveal>
        <Separator />

        <Reveal>
          <Bookmarks />
        </Reveal>
        <Separator className="screen-line-bottom" />
      </div>
    </>
  )
}

function getPageJsonLd(): WithContext<PageSchema> {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    dateCreated: new Date(USER.dateCreated).toISOString(),
    dateModified: new Date().toISOString(),
    mainEntity: {
      "@type": "Person",
      name: USER.displayName,
      identifier: USER.username,
      image: USER.avatar,
    },
  }
}
