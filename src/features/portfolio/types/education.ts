export type Education = {
  id: string
  /** Name of the school or university. */
  institution: string
  /** URL to the institution's website. */
  institutionUrl?: string
  /** Degree earned (e.g., "Master of Science in Computer Science"). */
  degree: string
  /**
   * Study period. Strings are rendered as-is, joined by an em dash.
   * Use "MM/YYYY" or "YYYY". Omit `end` for ongoing studies.
   */
  period: {
    start: string
    end?: string
  }
  /** Markdown details (GPA, courses, achievements, etc.). */
  description?: string
  /** UI icon; defaults to a graduation cap. */
  icon?: React.ReactElement
  /** Whether the item is expanded by default in the UI. */
  isExpanded?: boolean
}
