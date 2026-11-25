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
| Pixel companion sprite (`src/components/Companion/sprite.ts`: 2 idle, 4 walk, 4 teleport frames) | Drawn for this site by hand on a 16 × 16 grid, using Clive's own photo (`public/profile.jpg`) only as a likeness and clothing reference. Colours sampled from that photo and fitted to the site palette. Not traced from the photo and not adapted from any game sprite. Review sheet: `docs/design/companion/` | Part of this repository; Clive's likeness, all rights reserved | 2026-11-25 |
| GitHub and LinkedIn marks in `src/components/Icon/Icon.tsx` | The companies' published brand marks, used only to link to Clive's profiles | Trademarks of their owners | 2026-11-22 |

## Sound

| Asset | Source | Licence | Added |
|---|---|---|---|
| Interface cues (navigate, confirm, back, open, download) in `src/lib/sound.ts` | Written for this site and synthesised in the browser with the Web Audio API; no audio files, nothing sampled | Part of this repository | 2026-11-25 |
