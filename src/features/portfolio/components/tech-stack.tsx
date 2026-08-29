import { TECH_STACK } from "../data/tech-stack"
import type { TechStack as TechStackType } from "../types/tech-stack"
import { HandwrittenArrow, HandwrittenNote } from "./handwritten-note"
import { Panel, PanelHeader, PanelTitle } from "./panel"

const ID = "stack"

export function TechStack() {
  return (
    <Panel id={ID}>
      <PanelHeader>
        <PanelTitle>Stack</PanelTitle>
      </PanelHeader>

      <div className="relative [--badge-height:--spacing(6)] [--col-left-width:--spacing(48)]">
        <div
          className="pointer-events-none absolute inset-y-0 left-(--col-left-width) -z-1 w-px bg-[linear-gradient(to_bottom,var(--line)_4px,transparent_2px)] bg-size-[1px_6px] bg-repeat-y max-sm:hidden"
          aria-hidden
        />

        {Object.entries(groupByCategory(TECH_STACK)).map(
          ([category, items], index) => {
            const categoryId = `${ID}-${category
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "")}`
            const isToolsRow = category === "Tools & Design"

            return (
              <div
                key={category}
                className="relative grid items-start gap-y-2 border-b border-line py-4 last:border-none sm:grid-cols-[var(--col-left-width)_1fr]"
              >
                <div
                  id={categoryId}
                  className="pl-4 text-sm/(--badge-height) text-muted-foreground"
                >
                  <span
                    className="mr-1.5 font-mono text-muted-foreground/50 select-none"
                    aria-hidden
                  >
                    {(index + 1).toString().padStart(2, "0")}
                  </span>
                  {category}
                </div>

                <ul
                  aria-labelledby={categoryId}
                  className="flex flex-wrap gap-1.5 px-4"
                >
                  {items.map((item) => (
                    <li key={item.key} className="flex">
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener"
                        className="flex h-(--badge-height) items-center justify-center gap-1.5 rounded-md bg-zinc-50/80 px-1.75 font-mono text-xs text-foreground inset-ring-1 inset-ring-border select-none dark:bg-zinc-900/80"
                      >
                        <span
                          aria-hidden
                          className="size-4 shrink-0 bg-muted-foreground/80"
                          style={{
                            maskImage: `url(/tech-stack-icons/${item.key}.svg)`,
                            WebkitMaskImage: `url(/tech-stack-icons/${item.key}.svg)`,
                            maskRepeat: "no-repeat",
                            WebkitMaskRepeat: "no-repeat",
                            maskPosition: "center",
                            WebkitMaskPosition: "center",
                            maskSize: "contain",
                            WebkitMaskSize: "contain",
                          }}
                        />
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>

                {isToolsRow ? (
                  <HandwrittenNote
                    className="-top-1 right-full mr-2 hidden w-24 flex-col items-end lg:flex"
                    aria-hidden
                  >
                    <span className="-rotate-6">tools I use</span>
                    <HandwrittenArrow className="size-7 -scale-x-100 -rotate-6" />
                  </HandwrittenNote>
                ) : null}
              </div>
            )
          }
        )}
      </div>
    </Panel>
  )
}

function groupByCategory(
  items: TechStackType[]
): Record<string, TechStackType[]> {
  return items.reduce<Record<string, TechStackType[]>>((acc, item) => {
    for (const category of item.categories) {
      ;(acc[category] ??= []).push(item)
    }
    return acc
  }, {})
}
