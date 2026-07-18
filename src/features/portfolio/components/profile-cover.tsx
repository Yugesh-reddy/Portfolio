import { cn } from "@/lib/utils"

export function ProfileCover() {
  return (
    <div
      className={cn(
        "relative select-none border-x border-line",
        "screen-line-top screen-line-bottom before:-top-px after:-bottom-px"
      )}
    >
      <div
        className={cn(
          "relative aspect-2/1 overflow-hidden sm:aspect-3/1",
          // Curved bottom edge: an ellipse anchored at the top-center clips
          // the cover so the image bows down in the middle and rises toward
          // the corners.
          "[clip-path:ellipse(95%_100%_at_50%_0%)]"
        )}
      >
        {/* Both covers share identical sizing/positioning classes so the
            frame stays perfectly registered when the theme switches. The
            sm: object-position anchors lower so the cat on the bench stays
            in view within the wider 3:1 desktop crop. */}
        <img
          src="/images/hero-cover-light-v2.gif"
          alt=""
          aria-hidden
          className="absolute inset-0 size-full object-cover [image-rendering:pixelated] sm:object-[50%_85%] dark:hidden"
        />
        <img
          src="/images/hero-cover-dark-v2.gif"
          alt=""
          aria-hidden
          className="absolute inset-0 hidden size-full object-cover [image-rendering:pixelated] sm:object-[50%_85%] dark:block"
        />
        {/* Soft fade so the curve blends into the page background. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/35 to-transparent" />
      </div>
    </div>
  )
}
