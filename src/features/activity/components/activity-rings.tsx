import { cn } from "@/lib/utils"

type Progress = { move: number; exercise: number; stand: number }

const rings = [
  { key: "move", name: "Move", radius: 43, opacity: 1 },
  { key: "exercise", name: "Exercise", radius: 31, opacity: 0.65 },
  { key: "stand", name: "Stand", radius: 19, opacity: 0.4 },
] as const

export function ActivityRings({
  progress,
  className,
}: {
  progress?: Progress
  className?: string
}) {
  const label = progress
    ? rings
        .map(({ key, name }) => `${name}: ${progress[key]}% of goal`)
        .join(", ")
    : "Activity rings: no activity data connected"
  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label={label}
      className={cn("size-8 text-foreground", className)}
    >
      <title>{label}</title>
      {rings.map(({ key, radius, opacity }) => (
        <g key={key} fill="none" stroke="currentColor" strokeWidth="7">
          <circle
            cx="50"
            cy="50"
            r={radius}
            opacity={progress ? 0.1 : opacity * 0.2}
            strokeDasharray={progress ? undefined : "1 3"}
            strokeLinecap="round"
          />
          {progress && progress[key] > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              opacity={opacity}
              pathLength="100"
              strokeDasharray={`${Math.min(100, Math.max(0, progress[key]))} 100`}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
          )}
        </g>
      ))}
    </svg>
  )
}
