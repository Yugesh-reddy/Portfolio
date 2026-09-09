import { cn } from "@/lib/utils"

type Progress = { move: number; exercise: number; stand: number }

const rings = [
  { key: "move", name: "Move", radius: 42, color: "#fa375e" },
  { key: "exercise", name: "Exercise", radius: 30, color: "#a3e635" },
  { key: "stand", name: "Stand", radius: 18, color: "#22d3ee" },
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
    : "Activity rings — no activity data connected"
  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label={label}
      className={cn("size-8", className)}
    >
      <title>{label}</title>
      {rings.map(({ key, radius, color }) => (
        <g key={key} fill="none" strokeWidth="10">
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={color}
            opacity={progress ? 0.18 : 0.28}
          />
          {progress && progress[key] > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke={color}
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
