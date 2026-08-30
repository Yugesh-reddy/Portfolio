# Footer Ink Logotype Design

Date: 2026-08-30  
Status: approved for planning  
Reference feel: Heron AI–style large outlined wordmark + cursor-driven ink fill (user recording: pencil sketch letters with ink following the cursor)

## Goal

Replace the current footer `FluidGradientText` (“YUGESH”) with a **pencil-outline wordmark** whose **solid ink fill is revealed by a soft circular blob that follows the cursor** — only inside the letterforms.

## Non-goals

- No change to Inspired-by row, social icons, or safe-area spacer
- No full redesign of the entire footer grid (identity table was reverted; keep current strip + logotype slot)
- No canvas particle ink / physics fluid sim in v1
- No custom font file required if system/Helvetica-Bold (or existing display face) reads as a clean geometric wordmark; prefer matching site brand weight
- Touch / coarse pointer: show outline only (no blob tracking)

## Design read

Preserve-style portfolio. Footer logotype is a quiet craft moment: drafting outline + ink under the tip. Works with the sitewide pencil cursor streak (same graphite/white language). Desktop polish.

## Visual structure

### Layers (bottom → top)

1. **Pencil outline** — large `YUGESH` SVG `<text>` (or outlined paths), `fill="none"`, thin stroke (`currentColor` / muted), slightly imperfect opacity ~0.35–0.55 so it reads as graphite sketch  
2. **Ink fill (masked)** — same glyph, solid `fill` with `currentColor` / foreground, clipped by an SVG mask whose alpha is a soft radial gradient centered on the cursor  
3. Optional hairline under the block (existing `after:h-px` separator language can stay)

### Ink blob

- Soft radial gradient (opaque center → transparent edge)
- Diameter ~18–28% of logotype width (tweak in implementation)
- Position: cursor mapped into SVG user space; spring-smoothed (same family as current `FluidGradientText` springs)
- On mouse leave: blob fades/springs toward center or off (prefer fade opacity to 0 so outline remains)

### Typography

- Text: `YUGESH`
- Layout: full-bleed under footer chrome, similar scale to current `FluidGradientText` (`viewBox` ~1200×300, text size ~ viewBox height)
- Alignment: centered; slight vertical crop/translate allowed like today (`translate-y-[37.5%]`) so letters sit heavy on the baseline edge

## Behavior

| Condition | Behavior |
| --- | --- |
| Fine pointer + hover over logotype region | Blob tracks cursor; ink visible under tip |
| Fine pointer leave logotype | Ink fades out; outline remains |
| Coarse pointer / reduced motion | Outline only; no tracking blob |
| Dark / light | Stroke + fill use theme foreground; ink is solid fill (not orange) |

## Integration

- Replace implementation behind `SiteFooterInteractiveLogotype` (keep the export name so `site-footer.tsx` stays thin)
- New component e.g. `src/components/ink-fill-logotype.tsx` (or under `features/portfolio/components/`)
- May stop using `FluidGradientText` in the footer (registry component can remain for other uses)

## Accessibility

- Decorative wordmark: `aria-hidden` on the SVG (site name already elsewhere)
- `pointer-events` only for tracking on the container; does not block footer links above
- Respect `prefers-reduced-motion`

## Success criteria

- Outline reads as pencil sketch at rest
- Moving cursor over the wordmark reveals solid ink inside letters via a soft circular tip
- Touch devices: clean outlined YUGESH, no jank
- Inspired-by + socials unchanged above the logotype
