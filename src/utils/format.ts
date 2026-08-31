const NUMBER_FORMATTER = new Intl.NumberFormat("en-US")

const COMPACT_NUMBER_FORMATTER = new Intl.NumberFormat("en-US", {
  notation: "compact",
  compactDisplay: "short",
})

export function formatNumber(value: number): string {
  return NUMBER_FORMATTER.format(value)
}

export function formatCompactNumber(value: number): string {
  return COMPACT_NUMBER_FORMATTER.format(value)
}

export function formatDuration(seconds: number): string {
  const totalSeconds = Math.round(seconds)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60

  const parts: string[] = []
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (secs > 0) parts.push(`${secs}s`)

  return parts.length > 0 ? parts.join(" ") : "0s"
}
