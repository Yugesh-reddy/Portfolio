# Updating After hours

The four tiles share one shelf language — a numbered mono strip (`01`–`04`, TechStack style), a dashed rule, then a bespoke body — arranged as a bento grid. A tile may set a `Tag` on its dashed rule (the Listening state); the rule sits at the same height with or without one, so rules line up across a row. All artwork is monochrome until its card is hovered or focused, through the shared `artwork.module.css`. Desktop uses six columns (Listening 4 + Moving 2 on the first row, Watching 2 + Last stop 4 on the second); mobile stacks to one column. The header uses the shared `PanelTitle` with a `[04]` count and an “A little of life outside the editor.” handwritten note. A hatch separator sits between the tiles and the “About this site” row, matching every other section break. Technical credits live in the collapsed “About this site” row. The bottom YS and social strip remains separate.

## Watching

Edit `src/features/off-clock/data/interests.ts`. The tile accepts an optional `feature` with:

- `title`: a real current movie or anime.
- `note`: optional short personal observation, ideally under 55 characters.
- `image`: optional local public image path beginning with `/`.
- `imageAlt`: meaningful description of the photo or artwork.
- `href`: optional HTTPS destination for the feature.

Leave `feature: null` to keep the general descriptions based on your stated interests. Artwork is contained within its reserved visual area. The watching card is labeled “Credits rolled” (something already finished, pairing with “Last stop”) and drawn as a paper cinema ticket in the `Tag` material (`ticket.module.css`). The poster is printed on the top half, cropped to 6:7 from the top (closer to square on mobile). Keep the key art in the top ~80% so a logo along the bottom is cut cleanly rather than halved. Below a perforation with notched edges, the stub prints “Admit one”, the `note` (“Season 3”), the title, and a decorative barcode generated from the title. Titles wrap so the full title remains readable. On pointer hover or keyboard focus, the stub tears away along the perforation and the poster takes its color; reduced motion keeps the stub attached.

The current recent watch is **House of the Dragon, Season 3**, selected by Yugesh. Its ensemble poster without HBO Max branding is stored locally at `public/images/watching/house-of-the-dragon-season-3-ensemble.webp`, optimized from the [Season 3 artwork on TheTVDB](https://thetvdb.com/series/house-of-the-dragon/seasons/official/3) ([source image](https://artworks.thetvdb.com/banners/v4/season/2247337/posters/6a390708c849a.jpg), artwork © HBO). The portrait is monochrome by default in both themes, reveals its original color on pointer hover or keyboard focus, and respects reduced motion. The card links to HBO's series page. To change the recent watch, update the feature and replace the local artwork.

## Last stop (Chicago)

The tile is labeled “Last stop”: the most recent place you went, with a nod to Chicago’s L. It shows your own photos as instant prints lying on the table (`prints.module.css`), in the same paper as the ticket. Each print carries a handwritten caption and its exposure line on the bottom strip; there is no caption below the prints. From the `sm` breakpoint, where the tile sits beside the ticket, the prints take their size from the row height the ticket sets, so the prints and the ticket share the same top and bottom line. On mobile, where the tiles stack, the ticket is a fixed 18rem tall (its poster takes whatever height the stub leaves) and the prints fill an 18rem table, so the two tiles match there too. Hovering or focusing the card fans the prints apart, lifts them, and reveals their color; reduced motion keeps them still. Leave `feature: null` for a single blank “Out in Chicago” print.

The `chicago.feature` in `interests.ts` takes:

- `place`: names the card for screen readers when it links somewhere.
- `href`: optional HTTPS destination; the card is not a link without it.
- `photos`: one print each, ideally two or three. Each has `src`, `alt`, a short handwritten `caption`, and `exposure` (35mm-equivalent `focalLength`, `aperture`, `shutter`, `iso`).

To add a photo, export it as a 720×960 (3:4) WebP into `public/images/chicago/` with all metadata stripped (sharp drops EXIF, GPS and ICC by default; iPhone HEIC needs `sips -s format jpeg` first). Copy only the fields above from its EXIF. Use images you have permission to display.

The current prints are from Tribune Tower, 435 N Michigan Ave, on 23.03.2026: the night skyline with the tower's crown beside the Wrigley Building and Trump Tower (8:59 PM, 24mm ƒ/1.78 1/30s ISO 1600), and the Museum of Ice Cream banners on the tower's facade (9:01 PM, 48mm ƒ/1.78 1/40s ISO 200). Both are Yugesh's own iPhone 16 Pro Max photos.

## Live tiles

- Listening: follow [Spotify setup](spotify-setup.md). The cover is a sleeve with a vinyl record peeking out behind it; hovering slides the record out and reveals the cover's color. The tag on the rule reads “Now playing”, “Last played” or “Off the air”. While a song plays, the record spins and the footer shows a position that advances every second between polls; otherwise the footer shows when it was played (Chicago time, dated when not today) and its length. Reduced motion stops the spin and slide. Paused, private or absent playback does not claim a current song.
- Moving: follow [Apple Watch setup](activity-setup.md). Missing data shows neutral tracks. Real summaries show three ring colors and a sync timestamp, with stale data explicitly labeled.

Both live tiles stop polling while outside the viewport or while the tab is hidden. No account is required to render this section.
