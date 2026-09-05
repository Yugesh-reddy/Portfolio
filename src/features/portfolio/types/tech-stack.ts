/**
 * A technology item displayed in the Tech Stack section.
 *
 * Icons use /public/tech-stack-icons/[key].svg as a mask in both themes.
 */
export type TechStack = {
  /** Unique identifier used to resolve icon files. */
  key: string
  /** Display name of the technology. */
  title: string
  /** Official website URL. */
  href: string
  /** Category tags used for grouping/filtering. */
  categories: string[]
}
