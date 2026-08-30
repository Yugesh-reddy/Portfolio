# Square Cursor Trail Design

Date: 2026-08-30  
Status: approved for planning  
Reference feel: [heronaisapp.com](https://heronaisapp.com) custom cursor (small square + colored streak)

## Goal

Add a sitewide custom cursor: a small filled square at the pointer, followed by a short streak of fading squares that lag behind as the cursor moves — matching the Heron AI “square + color streak” feel without copying their brand mark.

## Non-goals

- No canvas / WebGL cursor
- No custom cursor on touch / coarse pointers
- No magnetic snap-to-link behavior in v1
- No cursor morph into text/I-beam or “view” labels on hover
- No change to existing SpotlightLogo / panel spotlight cursor effects (they coexist; custom cursor is global chrome)

## Design read

Preserve-style portfolio. Cursor is a quiet accent, not a gimmick. Pencil/graphite square (soft charcoal stroke, not brand orange) so it feels like a drafting mark on the page. Desktop polish only.

## Behavior

| Condition | Behavior |
| --- | --- |
| `(pointer: fine)` and not `prefers-reduced-motion` | Custom cursor on; `cursor: none` on `html` / interactive descendants |
| Coarse pointer or reduced motion | System cursor only; trail unmounted / inactive |
| Mouse leaves document | Hide lead + trail |
| Mouse enters document | Show lead + trail |

### Lead

- Shape: square (`border-radius: 0`)
- Size: ~8–10px
- Color: pencil/graphite — soft charcoal that reads on both themes (token `--cursor-accent`)
- Position: fixed, centered on clientX/Y (prefer **center** of square on hotspot)
- `pointer-events: none`, high z-index above UI chrome (~`z-[100]`)

### Trail (streak)

- Approach **A — DOM trail** (approved): 8–12 trailing squares
- Each segment lerps toward the previous segment / pointer (classic “snake” lag)
- Size: same as lead or slightly smaller toward the tail
- Opacity: fades along the chain (head opaque → tail ~0)
- Optional: slight scale-down on older segments
- Color: same pencil accent as lead

### Motion

- `requestAnimationFrame` loop for lerp (not CSS transition on every mousemove)
- Lerp factor ~0.25–0.4 for a short snappy streak (Heron-like, not long gooey trail)
- On reduced motion: do not mount

## Integration

- Client component mounted once from `src/app/(app)/layout.tsx` (or root layout if cursor should cover all routes including blog)
- **Scope:** whole site under the app shell (all `(app)` routes)
- Hide native cursor via a class on `document.documentElement` while active, e.g. `data-custom-cursor` → `cursor: none` in CSS (including `a`, `button`, inputs as needed)

## Tokens

```css
/* Light: graphite pencil on paper · Dark: soft lead on zinc */
--cursor-accent: oklch(0.35 0.01 260);
--cursor-size: 9px;
--cursor-trail-count: 10;

.dark {
  --cursor-accent: oklch(0.78 0.01 260);
}
```

Theme-aware so the “pencil” stays visible without going neon orange.

## Accessibility

- Decorative only; no ARIA
- Respect `prefers-reduced-motion: reduce`
- Never block clicks (`pointer-events: none` on all cursor nodes)
- Keyboard users unaffected

## Success criteria

- Fine-pointer desktop: system cursor hidden; square + streak follow pointer
- Touch / reduced motion: normal system cursor, no trail DOM cost
- No layout shift; no click targeting regressions
- Pencil accent reads as graphite in light mode and soft lead in dark mode
