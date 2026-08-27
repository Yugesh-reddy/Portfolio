# Handwritten Annotations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add five chandai-style handwritten gutter callouts (Caveat text + curved arrow) to the homepage at profile, social, contact, stack, and projects.

**Architecture:** Shared `HandwrittenNote` / `HandwrittenArrow` primitives, Caveat via `next/font/google` as `--font-handwritten`, absolute gutter placement on existing `relative` panels. Decorative only (`aria-hidden`, `pointer-events-none`), desktop-only visibility.

**Tech Stack:** Next.js 16, Tailwind CSS v4, `next/font/google` (Caveat), existing portfolio Panel layout

**Spec:** `docs/superpowers/specs/2026-08-29-handwritten-annotations-design.md`

## Global Constraints

- Copy is fixed: `hey, that's me` | `follow me` | `say hi` | `tools I use` | `stuff I built`
- Desktop only: `lg:flex` for most notes; profile uses `pointer-fine:xl:flex`
- No scroll/pathLength animation in v1
- Notes are decorative (`aria-hidden`); do not intercept clicks
- Do not change section content, IA, or badge systems
- Prefer chandai’s arrow SVG paths and class patterns for visual parity

## File map

| File | Responsibility |
| --- | --- |
| `src/lib/fonts.ts` | Register Caveat → `--font-handwritten` |
| `src/styles/globals.css` | Expose `--font-handwritten` in `@theme` |
| `src/features/portfolio/components/handwritten-note.tsx` | Shared note + arrow primitives |
| `src/features/portfolio/components/profile-header.tsx` | Profile callout |
| `src/features/portfolio/components/social-links/index.tsx` | Social callout |
| `src/features/portfolio/components/overview/index.tsx` | Contact / email callout |
| `src/features/portfolio/components/tech-stack.tsx` | Stack callout |
| `src/features/portfolio/components/projects/index.tsx` | Projects callout |

---

### Task 1: Font + HandwrittenNote primitives

**Files:**
- Modify: `src/lib/fonts.ts`
- Modify: `src/styles/globals.css` (add `--font-handwritten` next to other `--font-*` theme tokens, ~line 116–120)
- Create: `src/features/portfolio/components/handwritten-note.tsx`

**Interfaces:**
- Consumes: `cn` from `@/lib/utils`
- Produces:
  - `HandwrittenNote(props: React.ComponentProps<"div">)`
  - `HandwrittenArrow(props: React.ComponentProps<"svg">)`
  - CSS utility `font-handwritten` via `--font-handwritten`

- [ ] **Step 1: Register Caveat in fonts**

In `src/lib/fonts.ts`, add:

```ts
import { Caveat } from "next/font/google"
```

After `fontSerif`, add:

```ts
const fontHandwritten = Caveat({
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-handwritten",
})
```

Include `fontHandwritten.variable` in the `fontVariables` `cn(...)` list.

- [ ] **Step 2: Expose the theme token**

In `src/styles/globals.css` inside the `@theme` / font token block, add:

```css
--font-handwritten: var(--font-handwritten);
```

next to `--font-serif` / `--font-heading`.

- [ ] **Step 3: Create the primitives**

Create `src/features/portfolio/components/handwritten-note.tsx` with exactly:

```tsx
import { cn } from "@/lib/utils"

function HandwrittenNote({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="handwritten-note"
      className={cn(
        "pointer-events-none absolute font-handwritten text-xl/none tracking-normal text-muted-foreground select-none",
        className
      )}
      {...props}
    />
  )
}

/** Points down-left. Rotate or mirror it to aim at the subject. */
function HandwrittenArrow({
  className,
  ...props
}: React.ComponentProps<"svg">) {
  return (
    <svg
      className={cn("size-8 shrink-0 text-muted-foreground", className)}
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M34 4c1 15-5 26-21 30" />
      <path d="m21 36-8-2 7-7" />
    </svg>
  )
}

export { HandwrittenArrow, HandwrittenNote }
```

- [ ] **Step 4: Smoke-check the font variable is on `<html>`**

Run: `pnpm dev` (if not already), then:

```bash
curl -fsSL http://localhost:3000 | rg -o "font-handwritten|--font-handwritten|Caveat" | head
```

Expected: at least `--font-handwritten` / Caveat class residue from next/font on the document.

- [ ] **Step 5: Commit**

```bash
git add src/lib/fonts.ts src/styles/globals.css src/features/portfolio/components/handwritten-note.tsx
git commit -m "$(cat <<'EOF'
Add Caveat font and handwritten note primitives.

Shared HandwrittenNote/Arrow components for homepage gutter callouts.
EOF
)"
```

---

### Task 2: Profile + social callouts

**Files:**
- Modify: `src/features/portfolio/components/profile-header.tsx`
- Modify: `src/features/portfolio/components/social-links/index.tsx`

**Interfaces:**
- Consumes: `HandwrittenNote`, `HandwrittenArrow` from `./handwritten-note` (profile) / `@/features/portfolio/components/handwritten-note` (social)
- Produces: two visible desktop callouts — `hey, that's me` (right of YS mark), `follow me` (left of social icons)

- [ ] **Step 1: Add profile note beside the YS mark**

In `profile-header.tsx`, import:

```tsx
import { HandwrittenArrow, HandwrittenNote } from "./handwritten-note"
```

Inside the existing `<figure className="relative ...">`, after `<SpotlightLogo />` and before the figcaption, add:

```tsx
<HandwrittenNote
  className="bottom-20 left-full hidden w-36 flex-col items-start pointer-fine:xl:flex"
  aria-hidden
>
  <HandwrittenArrow className="-scale-y-100 -rotate-6" />
  <span className="ml-1 -rotate-6">hey, that&apos;s me</span>
</HandwrittenNote>
```

Do not remove `overflow-y-clip` on the outer grid (vertical only). Confirm the figure stays `relative`.

- [ ] **Step 2: Add social “follow me” note**

In `social-links/index.tsx`, import:

```tsx
import {
  HandwrittenArrow,
  HandwrittenNote,
} from "@/features/portfolio/components/handwritten-note"
```

As the last child inside `<Panel>` (sibling of `PanelContent`, not inside the `<ul>`), add:

```tsx
<HandwrittenNote
  className="-top-4 right-full mr-4 hidden w-20 flex-col items-end lg:flex"
  aria-hidden
>
  <span className="-rotate-6">follow me</span>
  <HandwrittenArrow className="size-7 translate-x-4 -scale-x-100 -rotate-6" />
</HandwrittenNote>
```

`Panel` already gets `relative` from `screen-line-top` / `screen-line-bottom` utilities — do not wrap an extra relative unless verification shows positioning is wrong.

- [ ] **Step 3: Browser-verify top-of-page notes**

Open `http://localhost:3000` at ≥1280px width, light mode:

1. Social row shows “follow me” + arrow in the left gutter
2. Profile mark shows “hey, that’s me” + arrow on the right at `xl` with a fine pointer
3. Clicking social icons still works (notes are non-interactive)
4. Resize below `lg`: both notes hidden; layout unchanged

- [ ] **Step 4: Commit**

```bash
git add src/features/portfolio/components/profile-header.tsx src/features/portfolio/components/social-links/index.tsx
git commit -m "$(cat <<'EOF'
Add handwritten callouts for profile and social links.

Match chandai-style gutter notes for follow-me and the YS mark.
EOF
)"
```

---

### Task 3: Contact, stack, and projects callouts

**Files:**
- Modify: `src/features/portfolio/components/overview/index.tsx`
- Modify: `src/features/portfolio/components/tech-stack.tsx`
- Modify: `src/features/portfolio/components/projects/index.tsx`

**Interfaces:**
- Consumes: `HandwrittenNote`, `HandwrittenArrow`
- Produces: `say hi` (right of overview grid), `tools I use` (left of stack), `stuff I built` (right of projects)

- [ ] **Step 1: Contact “say hi” on the overview grid**

In `overview/index.tsx`, import:

```tsx
import { HandwrittenArrow, HandwrittenNote } from "../handwritten-note"
```

Inside the existing `relative` grid (`className="relative grid gap-x-4 ..."`), as the last child (after the dotted divider div), add:

```tsx
<HandwrittenNote
  className="top-10 left-full ml-2 hidden w-16 flex-col items-start lg:flex"
  aria-hidden
>
  <span className="-rotate-3">say hi</span>
  <HandwrittenArrow className="size-7 -rotate-90 -scale-y-100" />
</HandwrittenNote>
```

Tune arrow transforms during verification so the tip aims at the email row (left column, second/third row). Prefer small transform tweaks over changing copy.

- [ ] **Step 2: Stack “tools I use”**

In `tech-stack.tsx`, import the primitives, then as the last child of `<Panel id={ID}>` add:

```tsx
<HandwrittenNote
  className="top-6 right-full mr-2 hidden w-24 flex-col items-end lg:flex"
  aria-hidden
>
  <span className="-rotate-6">tools I use</span>
  <HandwrittenArrow className="size-7 -scale-x-100 -rotate-6" />
</HandwrittenNote>
```

- [ ] **Step 3: Projects “stuff I built”**

In `projects/index.tsx`, import the primitives, then as the last child of `<Panel id="projects">` add:

```tsx
<HandwrittenNote
  className="top-6 left-full ml-2 hidden w-28 flex-col items-start lg:flex"
  aria-hidden
>
  <span className="rotate-3">stuff I built</span>
  <HandwrittenArrow className="size-7 mt-1 rotate-3" />
</HandwrittenNote>
```

- [ ] **Step 4: Browser-verify all five + both themes**

At desktop (`lg`/`xl`), light and dark:

| Spot | Expected copy | Side |
| --- | --- | --- |
| Profile mark | hey, that's me | right |
| Social | follow me | left |
| Overview / email | say hi | right |
| Stack | tools I use | left |
| Projects | stuff I built | right |

Also verify:

1. Mobile width: zero notes visible
2. Social / email / project links still clickable
3. No horizontal scrollbar; notes must sit inside `main` gutters (page uses `overflow-x-clip`)
4. Caveat renders (not falling back to Geist) on the note text

If a note is clipped by `overflow-x-clip` on `main`, shrink width / nudge `mr-*` / `ml-*` rather than removing `overflow-x-clip`.

- [ ] **Step 5: Commit**

```bash
git add \
  src/features/portfolio/components/overview/index.tsx \
  src/features/portfolio/components/tech-stack.tsx \
  src/features/portfolio/components/projects/index.tsx
git commit -m "$(cat <<'EOF'
Add handwritten callouts for contact, stack, and projects.

Complete the five homepage gutter annotations from the design spec.
EOF
)"
```

---

## Spec coverage checklist

| Spec requirement | Task |
| --- | --- |
| Caveat / `--font-handwritten` | Task 1 |
| `HandwrittenNote` + `HandwrittenArrow` | Task 1 |
| Profile `hey, that's me` | Task 2 |
| Social `follow me` | Task 2 |
| Contact `say hi` | Task 3 |
| Stack `tools I use` | Task 3 |
| Projects `stuff I built` | Task 3 |
| Desktop-only / alternating sides | Tasks 2–3 |
| Decorative a11y (`aria-hidden`, no pointer events) | Tasks 1–3 |
| Light + dark + mobile verification | Tasks 2–3 |
| No scroll animation / no extra sections | All tasks (YAGNI) |
