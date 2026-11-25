# Credits and asset licences

Every file in this repository that was not written or drawn for this site is listed here, with its source and licence. Add an entry **before** a new outside asset is committed.

## Rules

- Fonts: SIL Open Font License (OFL) 1.1 or a more permissive licence, self-hosted (the CSP only allows `font-src 'self'`).
- Decorative art: original work, or **CC0** only. Record each file separately, not per pack.
- Sound effects: original. They are synthesised in the browser (`src/lib/sound.ts`); nothing is sampled from a game or a sound library.
- Nothing from Pokémon or any other game franchise: no names, sprites, tiles, fonts, layouts, or audio.
- Generated mockups in `docs/design/mockups/` are design references only. They are not shipped to the site, and their placeholder portrait is not Clive.

## Fonts

| Asset | Used for | Source | Licence | Added |
|---|---|---|---|---|
| Plus Jakarta Sans (variable) | Body text, details, longer reading | [Fontsource `@fontsource-variable/plus-jakarta-sans`](https://fontsource.org/fonts/plus-jakarta-sans); upstream [tokotype/PlusJakartaSans](https://github.com/tokotype/PlusJakartaSans) | OFL 1.1 | 2026-11-22 |
| Pixelify Sans (variable) | Pixel design: headings, navigation, section numbers, short UI labels | [Fontsource `@fontsource-variable/pixelify-sans` 5.3.0](https://fontsource.org/fonts/pixelify-sans); upstream [eifetx/Pixelify-Sans](https://github.com/eifetx/Pixelify-Sans), © 2021 The Pixelify Sans Project Authors | OFL 1.1 | 2026-11-25 |

## Images

| Asset | Source | Licence | Added |
|---|---|---|---|
| `public/profile.jpg` | Clive's own formal photo | Owned by Clive; all rights reserved | 2026-11-22 |
| `public/projects/*` | Screenshots of Clive's own projects | Owned by Clive; all rights reserved | 2026-11-22 onward |
| `public/og-image.jpg` | Render of this site's pixel design (redrawn 2026-11-25) with Clive's own photo | Owned by Clive; all rights reserved | 2026-11-22 |

## Icons and interface art

| Asset | Source | Licence | Added |
|---|---|---|---|
| Line icons in `src/components/Icon/Icon.tsx` | Drawn for this site | Part of this repository | 2026-11-22 |
| 16 × 16 pixel icons in `src/components/PixelIcon/bitmaps.ts` | Drawn for this site | Part of this repository | 2026-11-25 |
| `public/favicon.svg` (pixel "CB" tile) | Drawn for this site as a 16 × 16 grid | Part of this repository | 2026-11-25 |
| Pixel companion sprite: source `src/components/Companion/sprite.ts`, exported by `scripts/export-companion.mjs` to `src/components/Companion/companion-sprites.png` (+ `.json` timings), shown on the site in the Pixel design. 79 frames on a 24 × 32 grid: idle, blink, tie beat, thumbs-up, walk down/up/right/left, hop, teleport out and in, and section actions and reactions (wave, magnifier, pouch and gem, sitting, emblem polish and nod, page and pointing, clipboard notes, shading eyes, lantern, music notes, looking around); props drawn as part of the sprite | Drawn for this site pixel by pixel by Claude Code (Anthropic's AI coding assistant) under Clive's direction, using `public/profile.jpg` only as the likeness reference (hair and fringe, ears, dark suit, white shirt, tie). The tie colour (site vermilion), trousers, and shoes are design choices, not from the photo. Not traced from the photo; no pixels, characters, poses, or effects copied or adapted from any game or other artwork. Earlier drafts (v1–v6, 2026-11-25) used a casual photo and style references Clive shared; none of that material is in this version or stored in this repository. Review sheet: `docs/design/companion/` | Part of this repository; Clive's likeness, all rights reserved | 2026-11-25 |
| GitHub and LinkedIn marks in `src/components/Icon/Icon.tsx` | The companies' published brand marks, used only to link to Clive's profiles | Trademarks of their owners | 2026-11-22 |

## Sound

| Asset | Source | Licence | Added |
|---|---|---|---|
| Interface cues (navigate, confirm, back, open, download) in `src/lib/sound.ts` | Written for this site and synthesised in the browser with the Web Audio API; no audio files, nothing sampled | Part of this repository | 2026-11-25 |
