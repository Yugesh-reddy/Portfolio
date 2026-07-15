import { GraduationCapIcon, InfinityIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { ProseMono } from "@/components/ui/typography"
import {
  Collapsible,
  CollapsibleChevronsIcon,
  CollapsiblePanel,
} from "@/components/base/collapsible-animated"
import { CollapsibleTrigger } from "@/components/base/ui/collapsible"
import { Markdown } from "@/components/markdown"
import type { Education } from "@/features/portfolio/types/education"

export function EducationItem({ education }: { education: Education }) {
  const { start, end } = education.period
  const isOngoing = !end

  return (
    <Collapsible
      id={`education-${education.id}`}
      className="group/education relative scroll-mt-14 py-4"
      defaultOpen={education.isExpanded}
      disabled={!education.description}
    >
      {/* Vertical timeline line connecting the icons; hidden on the last item. */}
      <span
        aria-hidden
        className="pointer-events-none absolute top-7 -bottom-7 left-3 w-px bg-border group-last/education:hidden"
      />

      <CollapsibleTrigger
        className={cn(
          "group block w-full text-left",
          "relative before:absolute before:-top-1 before:-right-1 before:-bottom-1.5 before:left-9 before:-z-1 before:rounded-lg before:transition-[background-color] before:ease-out hover:before:bg-accent-muted",
          "outline-none focus-visible:before:inset-ring-2 focus-visible:before:inset-ring-ring/50",
          "data-disabled:before:content-none"
        )}
      >
        <div className="relative z-1 mb-1 flex items-start gap-3">
          <div
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-lg",
              "bg-muted text-muted-foreground",
              "border border-muted-foreground/15 ring-1 ring-line ring-offset-1 ring-offset-background",
              "[&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
            )}
          >
            {education.icon ?? <GraduationCapIcon />}
          </div>

          <h3 className="flex-1 text-lg leading-snug font-semibold text-balance">
            {education.institution}
          </h3>

          <div className="shrink-0 text-muted-foreground group-data-disabled:hidden [&_svg]:h-lh [&_svg]:w-4">
            <CollapsibleChevronsIcon duration={0.15} />
          </div>
        </div>

        <dl className="flex items-center gap-2 pl-9 text-sm text-muted-foreground">
          <div>
            <dt className="sr-only">Degree</dt>
            <dd>{education.degree}</dd>
          </div>

          <Separator
            className="data-vertical:h-4 data-vertical:self-center"
            orientation="vertical"
          />

          <div>
            <dt className="sr-only">Study Period</dt>
            <dd className="flex items-center gap-0.5 tabular-nums">
              <span>{start}</span>
              <span className="font-mono">—</span>
              {isOngoing ? (
                <InfinityIcon
                  className="size-4.5 translate-y-[0.5px]"
                  aria-label="Present"
                />
              ) : (
                <span>{end}</span>
              )}
            </dd>
          </div>
        </dl>
      </CollapsibleTrigger>

      <CollapsiblePanel>
        {education.description && (
          <ProseMono className="pt-2 pl-9">
            <Markdown>{education.description}</Markdown>
          </ProseMono>
        )}
      </CollapsiblePanel>
    </Collapsible>
  )
}
