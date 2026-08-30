# Square Cursor Trail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sitewide Heron-style custom cursor — small pencil-colored square + DOM trail streak on fine pointers; system cursor elsewhere.

**Architecture:** Pure lerp helper + client `SquareCursor` component (rAF trail) mounted once in `(app)` layout. CSS tokens + `data-custom-cursor` hide native cursor. No canvas.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, `motion/react` `useReducedMotion`, existing `useMediaQuery` hook, `node:test` for lerp helper

**Spec:** `docs/superpowers/specs/2026-08-30-square-cursor-trail-design.md`

## Global Constraints

- Sitewide under `(app)` layout; fine pointer only
- Pencil/graphite accent (theme-aware), not orange/red
- DOM trail of 8–12 squares; rAF lerp ~0.25–0.4
- `pointer-events: none` on all cursor nodes; never block clicks
- Honor `prefers-reduced-motion: reduce` (unmount / inactive)
- Hide system cursor via `html[data-custom-cursor]` while active
- Do not change SpotlightLogo / panel spotlight behavior

## File map

| File | Responsibility |
| --- | --- |
| `src/features/portfolio/lib/cursor-trail.ts` | Pure lerp + trail step helpers |
| `src/features/portfolio/lib/cursor-trail.test.ts` | Unit tests for helpers |
| `src/components/square-cursor.tsx` | Client lead + trail DOM + listeners |
| `src/styles/globals.css` | `--cursor-*` tokens + `cursor: none` rule |
| `src/app/(app)/layout.tsx` | Mount `<SquareCursor />` |

---

### Task 1: Trail math helpers + tests

**Files:**
- Create: `src/features/portfolio/lib/cursor-trail.ts`
- Create: `src/features/portfolio/lib/cursor-trail.test.ts`

**Interfaces:**
- Produces:
  - `export type CursorPoint = { x: number; y: number }`
  - `export function lerp(a: number, b: number, t: number): number`
  - `export function stepTrail(points: CursorPoint[], target: CursorPoint, t: number): CursorPoint[]` — index 0 lerps to `target`; index `i` lerps to previous point; returns new array (immutable)

- [ ] **Step 1: Write failing tests**

```ts
import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { lerp, stepTrail } from "./cursor-trail.ts"

describe("lerp", () => {
  it("interpolates between endpoints", () => {
    assert.equal(lerp(0, 10, 0), 0)
    assert.equal(lerp(0, 10, 1), 10)
    assert.equal(lerp(0, 10, 0.5), 5)
  })
})

describe("stepTrail", () => {
  it("moves the head toward the target and pulls the tail", () => {
    const points = [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ]
    const next = stepTrail(points, { x: 100, y: 0 }, 0.5)
    assert.equal(next[0].x, 50)
    assert.equal(next[0].y, 0)
    assert.ok(next[1].x > 0)
    assert.ok(next[1].x < next[0].x)
  })

  it("does not mutate the input array", () => {
    const points = [{ x: 0, y: 0 }]
    const next = stepTrail(points, { x: 10, y: 0 }, 1)
    assert.equal(points[0].x, 0)
    assert.equal(next[0].x, 10)
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `node --experimental-strip-types --test src/features/portfolio/lib/cursor-trail.test.ts`

- [ ] **Step 3: Implement helpers**

```ts
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
```

- [ ] **Step 4: Run tests — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/features/portfolio/lib/cursor-trail.ts src/features/portfolio/lib/cursor-trail.test.ts
git commit -m "$(cat <<'EOF'
Add cursor trail lerp helpers.

EOF
)"
```

---

### Task 2: SquareCursor component + CSS tokens

**Files:**
- Create: `src/components/square-cursor.tsx`
- Modify: `src/styles/globals.css` (add tokens near theme fonts/colors; add cursor-none rule)

**Interfaces:**
- Consumes: `stepTrail`, `CursorPoint` from `@/features/portfolio/lib/cursor-trail`; `useReducedMotion` from `motion/react`; `useMediaQuery` from `@/hooks/use-media-query`
- Produces: `SquareCursor()` client component

Constants (in component file):

```ts
const TRAIL_COUNT = 10
const LERP = 0.35
const SIZE_PX = 9
```

- [ ] **Step 1: Add CSS tokens + hide native cursor**

In `src/styles/globals.css` inside `:root` (or `@theme` / existing token block used by the app for CSS variables — prefer next to other custom props in `:root` / `.dark`):

```css
:root {
  --cursor-accent: oklch(0.35 0.01 260);
  --cursor-size: 9px;
}

.dark {
  --cursor-accent: oklch(0.78 0.01 260);
}

html[data-custom-cursor] ,
html[data-custom-cursor] * {
  cursor: none !important;
}
```

Place the `:root` / `.dark` additions beside existing variable blocks (do not duplicate entire `:root` — merge into the existing one). The `html[data-custom-cursor]` rule can sit near other global utilities.

- [ ] **Step 2: Implement SquareCursor**

Create `src/components/square-cursor.tsx`:

```tsx
"use client"

import { useEffect, useRef } from "react"
import { useReducedMotion } from "motion/react"

import { useMediaQuery } from "@/hooks/use-media-query"
import {
  stepTrail,
  type CursorPoint,
} from "@/features/portfolio/lib/cursor-trail"

const TRAIL_COUNT = 10
const LERP = 0.35
const SIZE_PX = 9

export function SquareCursor() {
  const reduceMotion = useReducedMotion()
  const isFinePointer = useMediaQuery("(pointer: fine)")
  const enabled =
    isFinePointer === true && reduceMotion !== true

  const pointsRef = useRef<CursorPoint[]>(
    Array.from({ length: TRAIL_COUNT }, () => ({ x: 0, y: 0 }))
  )
  const targetRef = useRef<CursorPoint>({ x: 0, y: 0 })
  const visibleRef = useRef(false)
  const nodesRef = useRef<(HTMLDivElement | null)[]>([])
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled) {
      document.documentElement.removeAttribute("data-custom-cursor")
      return
    }

    document.documentElement.setAttribute("data-custom-cursor", "")

    const onMove = (event: PointerEvent) => {
      targetRef.current = { x: event.clientX, y: event.clientY }
      visibleRef.current = true
    }
    const onLeave = () => {
      visibleRef.current = false
    }
    const onEnter = () => {
      visibleRef.current = true
    }

    window.addEventListener("pointermove", onMove, { passive: true })
    document.documentElement.addEventListener("pointerleave", onLeave)
    document.documentElement.addEventListener("pointerenter", onEnter)

    const tick = () => {
      pointsRef.current = stepTrail(
        pointsRef.current,
        targetRef.current,
        LERP
      )
      const half = SIZE_PX / 2
      const show = visibleRef.current
      for (let i = 0; i < TRAIL_COUNT; i++) {
        const node = nodesRef.current[i]
        const p = pointsRef.current[i]
        if (!node || !p) continue
        const t = i / (TRAIL_COUNT - 1)
        const opacity = show ? 1 - t * 0.92 : 0
        const scale = 1 - t * 0.35
        node.style.transform = `translate3d(${p.x - half}px, ${p.y - half}px, 0) scale(${scale})`
        node.style.opacity = String(opacity)
      }
      rafRef.current = window.requestAnimationFrame(tick)
    }
    rafRef.current = window.requestAnimationFrame(tick)

    return () => {
      document.documentElement.removeAttribute("data-custom-cursor")
      window.removeEventListener("pointermove", onMove)
      document.documentElement.removeEventListener("pointerleave", onLeave)
      document.documentElement.removeEventListener("pointerenter", onEnter)
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current)
      }
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
    >
      {Array.from({ length: TRAIL_COUNT }, (_, i) => (
        <div
          key={i}
          ref={(el) => {
            nodesRef.current[i] = el
          }}
          className="absolute top-0 left-0 will-change-transform"
          style={{
            width: SIZE_PX,
            height: SIZE_PX,
            background: "var(--cursor-accent)",
            opacity: 0,
          }}
        />
      ))}
    </div>
  )
}
```

Note: If `useMediaQuery` returns `null`/`undefined` before hydration, treat as disabled until `true` to avoid SSR flash of custom cursor. Check the hook’s return type and gate with `=== true`.

- [ ] **Step 3: Typecheck**

Run: `pnpm check-types`  
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/square-cursor.tsx src/styles/globals.css
git commit -m "$(cat <<'EOF'
Add SquareCursor component and pencil accent tokens.

EOF
)"
```

---

### Task 3: Mount in app layout + browser verify

**Files:**
- Modify: `src/app/(app)/layout.tsx`

- [ ] **Step 1: Mount SquareCursor**

Prefer dynamic import like `ScrollToTop` to keep the server layout clean:

```tsx
const SquareCursor = dynamic(() =>
  import("@/components/square-cursor").then((mod) => mod.SquareCursor)
)
```

Render `<SquareCursor />` inside the layout root `div` (sibling of header/main/footer).

- [ ] **Step 2: Lint + types**

```bash
pnpm check-types
pnpm lint
```

- [ ] **Step 3: Browser verify**

1. Desktop Chrome, light + dark: move mouse — pencil square + streak; no OS arrow
2. DevTools device mode / coarse pointer: system cursor, no trail
3. `prefers-reduced-motion: reduce`: system cursor
4. Click links/buttons — still clickable
5. Leave browser viewport — trail hides

- [ ] **Step 4: Commit**

```bash
git add src/app/(app)/layout.tsx
git commit -m "$(cat <<'EOF'
Mount SquareCursor in the app layout.

EOF
)"
```

---

## Spec coverage

| Spec item | Task |
| --- | --- |
| Fine pointer only + reduced motion | Task 2 |
| Pencil theme tokens | Task 2 |
| DOM trail lerp | Task 1 + 2 |
| Hide native cursor | Task 2 |
| Sitewide `(app)` mount | Task 3 |
| pointer-events none | Task 2 |

## Self-review notes

- Visibility is a ref so the rAF effect does not restart on every enter/leave
- Trail index 0 is the lead (same size); opacity curve handles the “streak”
