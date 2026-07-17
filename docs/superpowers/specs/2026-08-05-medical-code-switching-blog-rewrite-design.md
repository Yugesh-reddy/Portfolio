# Design: Human rewrite of medical code-switching jailbreaks post

**Date:** 2026-08-05  
**Scope:** Single MDX post — `src/features/doc/content/medical-code-switching-jailbreaks.mdx`  
**Out of scope:** Other blog posts, UI/layout, nav, RSS, `llms.txt`

## Goal

Rewrite the post so it reads like a human engineer who built MediCS, not a lit-review template. Keep every citation and quantitative claim. Do not invent anecdotes beyond the existing post and the MediCS project blurb.

## Approach

Approach 2 — first-person problem essay.

## Structure

1. Hook: English refuse vs mixed-language comply
2. Why it matters (medicine + multilingual users; MediCS motivation)
3. Equity gap (Deng et al. numbers; fairness as safety that does not transfer)
4. Attack escalation (translate → token code-switch → word blend)
5. Two sticky findings (comprehension ≠ refusal; input-side failure; perplexity filters)
6. Why medical raises the stakes
7. Close → MediCS + links to red-team and DPO posts
8. References unchanged

## Voice rules

- First person for judgment and project framing
- No stacked em dashes; prefer commas, periods, or parentheses
- Kill templates: "It is tempting…", "Two findings make this…", "The unsettling part…"
- Keep all citations and numbers
- Title/description: clearer and less brochure-y; same topic

## Success criteria

- Same facts as before; no new invented lab stories
- Reads as first-person technical writing
- Cross-links to the other two MediCS posts remain
- Other posts untouched (voice template for later)
