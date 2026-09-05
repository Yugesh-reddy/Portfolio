export type CursorPoint = { x: number; y: number }

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function stepTrail(
  points: CursorPoint[],
  target: CursorPoint,
  t: number
): CursorPoint[] {
  const next: CursorPoint[] = new Array(points.length)
  for (let i = 0; i < points.length; i++) {
    const follow = i === 0 ? target : next[i - 1]
    const current = points[i]
    next[i] = {
      x: lerp(current.x, follow.x, t),
      y: lerp(current.y, follow.y, t),
    }
  }
  return next
}
