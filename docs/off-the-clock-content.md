# Updating After hours

The four tiles share one shelf language — a numbered mono strip (`01`–`04`, TechStack style), a dashed rule, then a bespoke body — arranged as a bento grid. Desktop uses six columns (Listening 4 + Moving 2 on the first row, Watching 2 + Around Chicago 4 on the second); mobile stacks to one column. The header uses the shared `PanelTitle` with a `[04]` count and an “A little of life outside the editor.” handwritten note. A hatch separator sits between the tiles and the “About this site” row, matching every other section break. Technical credits live in the collapsed “About this site” row. The bottom YS and social strip remains separate.

## Watching and Around Chicago

Edit `src/features/off-clock/data/interests.ts`. Each tile accepts an optional `feature` with:

- `title`: a real current movie/anime, or a place you explored.
- `note`: optional short personal observation, ideally under 55 characters.
- `image`: optional local public image path beginning with `/`.
- `imageAlt`: meaningful description of the photo or artwork.
- `href`: optional HTTPS destination for the feature.

Leave `feature: null` to keep the general descriptions based on your stated interests. Artwork is contained within its reserved visual area. Watching titles wrap so the full title remains readable; caption space supports two lines. The watching card is labeled “Recently watched,” with “Admit one” on the header's dashed divider above the poster. The title is followed by “Season 3,” with no repeated recent-watch caption.

The current recent watch is **House of the Dragon, Season 3**, selected by Yugesh. Its ensemble poster without HBO Max branding is stored locally at `public/images/watching/house-of-the-dragon-season-3-ensemble.webp`, optimized from the [Season 3 artwork on TheTVDB](https://thetvdb.com/series/house-of-the-dragon/seasons/official/3) ([source image](https://artworks.thetvdb.com/banners/v4/season/2247337/posters/6a390708c849a.jpg), artwork © HBO). The portrait is monochrome by default in both themes, reveals its original color on pointer hover or keyboard focus, and respects reduced motion. The card links to HBO's series page. To change the recent watch, update the feature and replace the local artwork.

For Chicago, one of your own photos with a place name and one sentence is a natural first addition. It needs no Instagram iframe or external account connection. Use images you have permission to display.

## Live tiles

- Listening: follow [Spotify setup](spotify-setup.md). An active song shows its cover, artist and Spotify link. Paused, private or absent playback does not claim a current song.
- Moving: follow [Apple Watch setup](activity-setup.md). Missing data shows neutral tracks. Real summaries show three ring colors and a sync timestamp, with stale data explicitly labeled.

Both live tiles stop polling while outside the viewport or while the tab is hidden. No account is required to render this section.
