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

/** True once every trail point sits on the target, so drawing can stop. */
export function isTrailSettled(
  points: CursorPoint[],
  target: CursorPoint,
  epsilon = 0.1
): boolean {
  return points.every(
    (point) =>
      Math.abs(point.x - target.x) < epsilon &&
      Math.abs(point.y - target.y) < epsilon
  )
}

/** Padded box around the trail, in CSS pixels, for clearing only what was drawn. */
export function trailBounds(points: CursorPoint[], padding: number) {
  let left = Infinity
  let top = Infinity
  let right = -Infinity
  let bottom = -Infinity
  for (const { x, y } of points) {
    left = Math.min(left, x)
    top = Math.min(top, y)
    right = Math.max(right, x)
    bottom = Math.max(bottom, y)
  }
  return {
    x: left - padding,
    y: top - padding,
    width: right - left + padding * 2,
    height: bottom - top + padding * 2,
  }
}
