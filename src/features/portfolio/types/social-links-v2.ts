export type SocialLink = {
  name: string
  title: string
  icon: React.JSX.Element
  handle: string
  /**
   * Public profile URL. Omit it for platforms where a handle has no linkable
   * profile (Discord deep links need a numeric user ID, not a username), and
   * the handle is offered as click-to-copy instead.
   */
  href?: string
}
