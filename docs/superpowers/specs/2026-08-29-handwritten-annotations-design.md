# Handwritten Annotations Design

Date: 2026-08-29  
Status: approved for planning  
Reference: [chanhdai.com](https://chanhdai.com) handwritten gutter notes

## Goal

Add a small set of casual, hand-drawn callouts (handwritten text + curved arrow) to the homepage, matching the feel of chandai’s “follow me” annotations without cluttering the page or breaking mobile layout.

## Non-goals

- No annotations on every section
- No draw-on-scroll / pathLength animation in v1
- No annotations on blog posts, project detail pages, or docs
- No change to section content, IA, or badge systems

## Design read

Preserve-style polish on a developer portfolio for recruiters and peers. Casual guide voice. Desktop-gutter only. Existing Geist + muted zinc language stays primary; Caveat is decorative only.

## Placement and copy

Five callouts on the homepage, desktop gutters only:

| Spot | Target | Copy | Side | Breakpoint |
| --- | --- | --- | --- | --- |
| Profile / YS mark | `ProfileHeader` figure | `hey, that's me` | right of mark (`left-full`) | `pointer-fine:xl` (gutter needs room) |
| Social icons | `SocialLinks` panel | `follow me` | left (`right-full`) | `lg+` |
| Contact / email | Overview email row | `say hi` | right of overview grid (`left-full`), aimed at email | `lg+` |
| Stack | `TechStack` panel | `tools I use` | left (`right-full`) | `lg+` |
| Projects | `Projects` panel | `stuff I built` | right (`left-full`) | `lg+` |

Sides alternate so gutters stay balanced: right, left, right, left, right. Slight rotations (`-rotate-3` / `-rotate-6`) keep them from looking machine-aligned.

## Visual system

- Font: Google `Caveat` (weights 400/500) as `--font-handwritten`
- Color: `text-muted-foreground`
- Size: about `text-xl/none`, tracking normal
- Arrow: single curved SVG (40×40 viewBox), stroke `currentColor`, tip path included; flip/rotate via Tailwind (`-scale-x-100`, `-scale-y-100`, rotate utilities)
- Interaction: `pointer-events-none`, `select-none`, `aria-hidden` (decorative only; section headings and links remain the accessible labels)
- No animation in v1

## Component API

New file: `src/features/portfolio/components/handwritten-note.tsx`

```tsx
function HandwrittenNote({ className, ...props }: React.ComponentProps<"div">)
function HandwrittenArrow({ className, ...props }: React.ComponentProps<"svg">)
```

`HandwrittenNote` always includes the shared base classes (`pointer-events-none absolute font-handwritten text-xl/none tracking-normal text-muted-foreground select-none`). Call sites pass position, visibility, and flex alignment.

## Font wiring

1. Register Caveat in `src/lib/fonts.ts` with `variable: "--font-handwritten"`
2. Include it in `fontVariables`
3. Expose `--font-handwritten` in `src/styles/globals.css` under `@theme` so `font-handwritten` works as a Tailwind utility

## Integration points

- `profile-header.tsx` — note beside SpotlightLogo / YS mark
- `social-links/index.tsx` — wrap panel content in `relative`, add “follow me”
- `overview/index.tsx` (or `email-item.tsx`) — “say hi” near email
- `tech-stack.tsx` — “tools I use”
- `projects/index.tsx` — “stuff I built”

Parent containers must be `relative` and must not `overflow: hidden` in a way that clips the gutter notes. Prefer hanging into page gutters outside `md:max-w-3xl` content, same as chandai.

## Responsive behavior

- Hidden below `lg` for most notes
- Profile note uses `pointer-fine:xl:flex` because the mark’s right gutter is tight until wider viewports
- Mobile/tablet keep the clean stacked layout with no decorative notes

## Accessibility

- Decorative only (`aria-hidden` on notes)
- Do not replace or compete with real headings
- Reduced-motion: N/A for v1 (static)

## Verification

1. Homepage light + dark at desktop (`lg` / `xl`): all five notes visible, arrows aim at the right targets
2. Homepage at mobile width: notes hidden, no layout shift or clipped overflow
3. Confirm Caveat loads and `font-handwritten` resolves
4. Confirm notes do not intercept clicks on social icons, email, or project links

## Out of scope / later

- Experience / blog callouts (explicitly deferred from the 7-spot wishlist to keep density at 5)
- Scroll-draw animation
- Handwritten panel titles (chandai uses Caveat for “Good morning”; not requested here)
