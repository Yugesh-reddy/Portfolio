import { cn } from "@/lib/utils"

/**
 * Shared scroll reveal for the portfolio.
 *
 * Sections fade and lift a short distance as they scroll into view. The fade is
 * a CSS scroll-driven animation (`reveal` in globals.css), so the browser runs
 * it off the main thread and content never waits on JavaScript: a busy page
 * can't leave a section blank. Browsers without scroll timelines, and visitors
 * who prefer reduced motion, see the content as is.
 */
export function Reveal({
  delay,
  className,
  style,
  ...props
}: React.ComponentProps<"div"> & {
  /**
   * Seconds to wait before fading in on page load. For hero sections that are
   * already on screen, where there's no scroll to drive the reveal.
   */
  delay?: number
}) {
  if (delay === undefined) {
    return <div className={cn("reveal", className)} style={style} {...props} />
  }

  return (
    <div
      className={cn("reveal-on-load", className)}
      style={{ "--reveal-delay": `${delay}s`, ...style } as React.CSSProperties}
      {...props}
    />
  )
}
