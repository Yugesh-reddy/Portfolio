# Footer Ink Logotype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace footer `FluidGradientText` with a pencil-outline **YUGESH** wordmark whose solid ink fill is revealed by a soft circular blob following the cursor.

**Architecture:** SVG dual-layer text (stroke outline + masked fill). Cursor position drives a spring-smoothed radial gradient in an SVG `<mask>`. Wire through existing `SiteFooterInteractiveLogotype`.

**Tech Stack:** Next.js 16, React 19, `motion/react` (`useMotionValue`, `useSpring`, `useReducedMotion`), SVG mask, existing footer shell

**Spec:** `docs/superpowers/specs/2026-08-30-footer-ink-logotype-design.md`

## Global Constraints

- Text is `YUGESH` only
- Soft ink blob (radial mask), not horizontal gradient sweep
- Pencil outline always visible; ink only under blob
- Fine pointer + hover; outline-only on coarse / reduced motion
- Do not change Inspired-by, socials, or safe-area spacer
- Keep export `SiteFooterInteractiveLogotype` for `site-footer.tsx`
- Ink/outline use theme foreground (graphite/white — no orange)

## File map

| File | Responsibility |
| --- | --- |
| `src/components/ink-fill-logotype.tsx` | Client SVG outline + masked ink blob |
| `src/components/site-footer-brand.tsx` | Swap to `InkFillLogotype` |
| (optional) leave `FluidGradientText` registry untouched |

---

### Task 1: InkFillLogotype component

**Files:**
- Create: `src/components/ink-fill-logotype.tsx`

**Interfaces:**
- Consumes: `motion`, `useMotionValue`, `useSpring`, `useReducedMotion` from `motion/react`; `useMediaQuery` from `@/hooks/use-media-query`
- Produces: `InkFillLogotype({ text?: string })` default `text="YUGESH"`

Constants:

```ts
const VIEW_W = 1200
const VIEW_H = 300
const BLOB_RADIUS = 160 // SVG user units; ~13% of width
```

- [ ] **Step 1: Implement component**

Create `src/components/ink-fill-logotype.tsx`:

```tsx
"use client"

import { useId } from "react"
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react"

import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

const VIEW_W = 1200
const VIEW_H = 300
const BLOB_RADIUS = 160

const TEXT_STYLE: React.CSSProperties = {
  fontFamily: "Helvetica, Arial, sans-serif",
  fontSize: VIEW_H,
  fontWeight: 700,
}

export function InkFillLogotype({
  text = "YUGESH",
  className,
}: {
  text?: string
  className?: string
}) {
  const reactId = useId()
  const maskId = `ink-fill-mask-${reactId.replace(/:/g, "")}`
  const reduceMotion = useReducedMotion()
  const isFinePointer = useMediaQuery("(pointer: fine)")
  const track =
    isFinePointer === true && reduceMotion === false

  const rawX = useMotionValue(VIEW_W / 2)
  const rawY = useMotionValue(VIEW_H / 2)
  const rawOpacity = useMotionValue(0)
  const x = useSpring(rawX, { stiffness: 220, damping: 32, mass: 0.45 })
  const y = useSpring(rawY, { stiffness: 220, damping: 32, mass: 0.45 })
  const opacity = useSpring(rawOpacity, {
    stiffness: 180,
    damping: 28,
    mass: 0.4,
  })

  const onMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!track) return
    const rect = event.currentTarget.getBoundingClientRect()
    const nx = ((event.clientX - rect.left) / rect.width) * VIEW_W
    const ny = ((event.clientY - rect.top) / rect.height) * VIEW_H
    rawX.set(Math.max(0, Math.min(VIEW_W, nx)))
    rawY.set(Math.max(0, Math.min(VIEW_H, ny)))
    rawOpacity.set(1)
  }

  const onLeave = () => {
    rawOpacity.set(0)
  }

  return (
    <div
      className={cn(
        "relative size-full overflow-hidden after:absolute after:bottom-0 after:h-px after:w-full after:bg-current/15",
        className
      )}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <svg
        className="size-full translate-y-[37.5%] select-none"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <motion.radialGradient
            id={`${maskId}-grad`}
            cx={x}
            cy={y}
            r={BLOB_RADIUS}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="55%" stopColor="white" stopOpacity="0.85" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </motion.radialGradient>
          <mask id={maskId}>
            <motion.rect
              x="0"
              y="0"
              width={VIEW_W}
              height={VIEW_H}
              fill={`url(#${maskId}-grad)`}
              style={{ opacity }}
            />
          </mask>
        </defs>

        {/* Pencil outline */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.45}
          strokeWidth={2.25}
          style={TEXT_STYLE}
        >
          {text}
        </text>

        {/* Ink fill — revealed by cursor blob */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fill="currentColor"
          mask={`url(#${maskId})`}
          style={TEXT_STYLE}
        >
          {text}
        </text>
      </svg>
    </div>
  )
}
```

Notes:
- Unique `maskId` via `useId` avoids clashes if multiple instances mount
- When `track` is false, never set opacity to 1 (outline-only)
- `motion.radialGradient` + `motion.rect` need Motion’s SVG support (already used in `FluidGradientText`)

- [ ] **Step 2: Typecheck**

Run: `pnpm check-types`  
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/ink-fill-logotype.tsx
git commit -m "$(cat <<'EOF'
Add InkFillLogotype with cursor-driven ink blob mask.

EOF
)"
```

---

### Task 2: Wire into SiteFooterInteractiveLogotype + verify

**Files:**
- Modify: `src/components/site-footer-brand.tsx`

- [ ] **Step 1: Swap implementation**

Replace contents of `src/components/site-footer-brand.tsx`:

```tsx
import { InkFillLogotype } from "@/components/ink-fill-logotype"

export function SiteFooterInteractiveLogotype() {
  return (
    <div className="screen-line-bottom text-foreground">
      <InkFillLogotype text="YUGESH" />
    </div>
  )
}
```

- [ ] **Step 2: Lint + types**

```bash
pnpm check-types
pnpm lint
```

- [ ] **Step 3: Browser verify**

1. Scroll to footer, light + dark
2. At rest: pencil outline YUGESH visible, little/no solid fill
3. Move cursor over letters: soft circular ink fill follows tip inside glyphs
4. Leave logotype: ink fades; outline remains
5. Mobile / coarse: outline only
6. Confirm Inspired-by + socials unchanged; sitewide square cursor still works above

- [ ] **Step 4: Commit**

```bash
git add src/components/site-footer-brand.tsx
git commit -m "$(cat <<'EOF'
Use ink-fill logotype in the site footer.

EOF
)"
```

---

## Spec coverage

| Spec item | Task |
| --- | --- |
| Pencil outline | Task 1 |
| Soft ink blob mask | Task 1 |
| YUGESH wordmark | Task 1–2 |
| Fine pointer / reduced motion | Task 1 |
| Keep footer chrome | Task 2 |
| Replace FluidGradientText in footer only | Task 2 |

## Self-review notes

- If Motion cannot animate `radialGradient` `cx`/`cy` as motion values in this version, fall back to updating gradient attributes in `requestAnimationFrame` / `useMotionValueEvent`
- Blob radius may need visual tuning after first browser pass
