# Phase 5 validation record

Results of the release-candidate checks. Status values: **Passed**, **Failed**, **Not run**, **Blocked**.

## Run 1 — 2026-11-22 (automated)

Target: local production build (`npm run build` + `vite preview`). The Vercel security headers in `vercel.json` are not served by `vite preview`, so they are checked in Phase 6 on the deployed URL.

### Build and dependencies

| Check | Command | Result |
|---|---|---|
| Lint | `npm run lint` | Passed |
| Type check and build | `npm run build` | Passed |
| Dependency audit | `npm audit` | Passed — 0 vulnerabilities |
| CI on push | GitHub Actions | Passed on `bab1bb4` |

### Links

Every external URL in `src/` was requested with `curl -L`.

| Link | Result |
|---|---|
| CareerTrack live site, SmartFeather live site | Passed (200) |
| GitHub: profile, CareerTrack, Pedalya, SmartFeather, Pasa-Buy-Project | Passed (200) |
| GitHub: `Clive-04/Pasa-Buy` | Failed (404) at first; the owner made the repository public again the same day, and it now returns 200 (Passed) |
| Credly profile and all 8 Credly badge pages | Passed (200) |
| Certiport verification | Passed (200) |
| LinkedIn | Not verifiable by script (LinkedIn answers bots with status 999); check by hand |
| Résumé PDF (`/Clive-Owen-Benito-Resume.pdf`) | Passed — served as `application/pdf`, both download buttons present |
| `target="_blank"` links | Passed — all have `rel="noopener noreferrer"` |

### Browser checks (headless Edge and headless Chrome, Playwright + axe-core 4.10)

48 checks, all **Passed** in both browsers after the fixes below.

- **axe-core (WCAG 2.2 AA + best practice):** no violations on the whole page at 1280px and 390px, on all six skills tabs, or in any of the four open case studies.
- **Keyboard:**
  - The first Tab reaches a visible "Skip to content" link, which moves focus to `<main>`.
  - All 34 tab stops have a visible focus style and stay clear of the sticky header once scrolled to.
  - Skills tabs: Arrow keys, Home and End work, with wrap-around. Tab leaves the tab list for the panel.
  - The ticker's pause button toggles with Enter or Space, and the drift animations really stop.
- **Case-study dialog:**
  - Focus moves into the dialog on open, and the dialog is named by the project title.
  - Tab never reaches the page behind. Native modal behavior: after the last control, focus passes to the browser UI, then wraps back.
  - Next opens the next case study. Escape closes it, and focus returns to that project's card.
- **Mobile menu (390px):**
  - Opens with Enter (`aria-expanded`), and Escape closes it, returning focus to the toggle.
  - Closed links are hidden and cannot be tabbed to.
  - The case study opens as a bottom sheet that fits the screen.
- **Reduced motion (`prefers-reduced-motion: reduce`):**
  - No animations are running after scrolling, and all content is fully visible.
  - The case study opens and closes instantly, and the pause button is hidden because nothing moves.
- **Default motion:** every scroll-revealed block ends fully visible.
- **Layout:** no horizontal scrolling at 320, 390, 768, 1024 or 1440px.
- **Other:** no console errors, all images load, one `<h1>`, `lang`, title and description present.

### Lighthouse 12.6 (headless Edge, production build)

| | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| Mobile | 72 | 100 | 100 | 100 |
| Desktop | 97 | 100 | 100 | 100 |

Mobile performance is held back by Total Blocking Time. On this machine it varied between 0.9 s and 2.7 s across repeated runs of the **same** build. The trace shows the blocking task is the main thread waiting on the compositor/GPU for the first frame; JavaScript itself takes about 0.2 s. A/B runs with the grain, backdrop blur, masks or individual animations switched off did not separate from that noise. Headless Edge draws in software here, which exaggerates paint cost, so no design change was made on this evidence. **Re-measure with PageSpeed Insights on the deployed URL and on a real phone (Phase 6).**

Desktop CLS is 0.075 (the "good" threshold is 0.1), coming from the tech ticker as the web font swaps in.

### Fixed during this run

1. **Header overflowed at 320px** (WCAG 1.4.10 reflow: a 1280px screen at 400% zoom). The full name plus the Menu button needed about 341px. Below 22rem the name is now visually hidden but still in the link, so screen readers hear it; above that, it shrinks with an ellipsis instead of overflowing.
2. **Closed case-study dialogs downloaded every screenshot on page load.** Dialog images are now `loading="lazy"`.
3. **Screenshots converted from JPG to WebP** (same 1600×768): 294 KiB → 131 KiB.
4. **No `robots.txt`**, so the HTML page was served in its place. Added `public/robots.txt`, and SEO is now 100.

## Run 2 — 2026-11-22 (pre-deploy CSP check and production)

### CSP before deploying

`dist/` was served locally with the exact headers from `vercel.json`, and every interactive part of the page was exercised while listening for `securitypolicyviolation` events.

- **Found:** Vite inlined the 1.7 KB Cyrillic-ext font subset as a `data:` URI, which `font-src 'self'` blocks (a console error on the live site).
- **Fixed** in `vite.config.ts`: fonts are never inlined.
- **After the fix:** 0 violations, 0 console errors, and 48/48 checks pass under the real headers.

### Production: https://clive-benito.vercel.app/

| Check | Result |
|---|---|
| HTTPS | Passed |
| `http://` → `https://` | Passed (308 permanent redirect) |
| Security headers: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS | Passed (all six served) |
| Deployed build matches `main` | Passed (asset hashes identical to the local build of `b5a1f9b`) |
| Résumé PDF, sharing image, robots.txt, screenshots, favicon | Passed (200 with correct types) |
| Compression | Passed (JS served at 85 KB) |
| Full suite against production (Edge and Chrome) | Passed (48/48 each) |
| CSP violations / console errors on production | Passed (none) |
| PageSpeed Insights API | Not run — the shared anonymous API quota was exhausted; run it at pagespeed.web.dev |

Lighthouse 12.6 from the test machine against production:

| | Performance | Accessibility | Best practices | SEO | FCP | LCP | CLS |
|---|---|---|---|---|---|---|---|
| Mobile (3 runs) | 67–73 | 100 | 100 | 100 | 1.4–1.5 s | 1.6–1.7 s | 0 |
| Desktop | 79 | 100 | 100 | 100 | 0.4 s | 0.4 s | 0.075 |

Load metrics are good: 170 KiB in total and LCP under 2 s on simulated slow 4G. The performance score is again pulled down only by Total Blocking Time, which swung from 1.5 s to 4.6 s across identical runs. This is the local-CPU noise described in Run 1.

## Run 3 — 2026-11-22 (manual, by the owner)

| Check | Result |
|---|---|
| NVDA (Windows): headings list, skills tabs and table, case-study title on open, "opens in a new tab" announcements | Passed |
| Real phone: menu, bottom-sheet case study, skills table, résumé download, motion smoothness | Passed |
| LinkedIn link, opened by hand | Passed |
| Browser zoom to 400% on a laptop | Passed — nothing cut off |
| Windows "Animation effects" off (Settings → Accessibility → Visual effects), browser restarted | Passed — sections appear without fading or sliding, the ticker is still and its pause button is hidden, and the case study opens and closes instantly |
| Firefox and Safari/iOS | Not run — skipped by the owner; Chromium (Edge, Chrome) and the phone browser were covered |

### PageSpeed Insights

[Mobile report](https://pagespeed.web.dev/analysis/https-clive-benito-vercel-app/8k6gdzlxz2?form_factor=mobile) · [Desktop report](https://pagespeed.web.dev/analysis/https-clive-benito-vercel-app/8k6gdzlxz2?form_factor=desktop), captured 2026-11-22 1:41 PM GMT+8 with Lighthouse 13.6.0.

| | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS | Speed Index |
|---|---|---|---|---|---|---|---|---|---|
| Mobile (Moto G Power, slow 4G) | 100 | 100 | 100 | 100 | 0.9 s | 1.5 s | 0 ms | 0 | 1.1 s |
| Desktop | 100 | 100 | 100 | 100 | 0.2 s | 0.3 s | 0 ms | 0 | 0.4 s |

This settles the Total Blocking Time question from Runs 1 and 2. On Google's hardware TBT is 0 ms, so the 1–4.6 s seen locally came from the test machine drawing in software, not from the site. There is no field (CrUX) data yet, because the site is too new to have enough real-visitor traffic.

Remaining suggestions (none affect the score): about 38 KiB of unused JavaScript, possible image savings (29 KiB on mobile, 116 KiB on desktop), and one render-blocking request (about 150 ms on mobile).

## Result

Phase 5 is complete. Every check passed except Firefox and Safari/iOS, which the owner chose to skip.

## Open items found

- ~~`github.com/Clive-04/Pasa-Buy` returns 404.~~ Resolved on 2026-11-22: the owner made the repository public again, and the link returns 200.

## Run 4 — 2026-11-25 (pixel redesign shell, branch `feature/pixel-theme`, automated)

Scope: the pixel shell only (tokens, fonts, sidebar, mobile menu, display controls, sound switch, first-visit sound prompt). The page sections are not restyled yet, so this is not the release gate; the full Phase 5 set (NVDA, real phone, 400% zoom, PageSpeed, Firefox/Safari decision) is repeated for Day and Night before Pixel ships.

### Commands

| Command | Result |
|---|---|
| `npm run lint` (oxlint, `--deny-warnings`) | Passed, 0 warnings |
| `npm test` (Node test runner) | Passed, 27/27 |
| `npm run build` (`tsc -b && vite build`) | Passed |

### Browser checks (headless Edge, Playwright + axe-core 4.10, `dist/` served with the `vercel.json` headers)

Three looks (Classic, Pixel Day, Pixel Night) × three widths (1280, 390, 320 px), plus reduced motion at 1280 px: 12 runs, **137 checks passed, 0 failed**.

| Check | Result |
|---|---|
| `data-design` / `data-color-theme` applied from saved choices before React loads | Passed |
| CSP violations, console errors | 0 in every run |
| Horizontal scrolling at 1280, 390, 320 px | None |
| axe-core WCAG 2.0/2.1/2.2 A and AA | 0 violations in every run |
| Skip link is the first Tab stop and moves focus to `main` | Passed |
| Narrow menu: hidden links leave the Tab order, Tab enters the open menu, Escape closes it and returns focus to the button | Passed (Classic and Pixel) |
| Pixel header controls at least 44 px tall | Passed after fix `fc086ea` (brand link was 36 px) |
| Pixel: fixed 240 px sidebar at 1280 px, top bar with menu button at 390/320 px | Passed |
| Pixel: Pixelify Sans on `h1`, Plus Jakarta Sans on paragraphs | Passed |
| No `AudioContext` created on page load (sound never autoplays) | Passed in every run |
| First-visit sound prompt shown in Pixel, never in Classic | Passed |
| Reduced motion: no running animations | Passed |

Also checked by hand in the in-app browser: the Pixel mode switch keeps keyboard focus when the layout changes; Day/Night and sound choices persist across reloads; "Not now" removes the prompt, moves focus to `main`, and it stays dismissed after reload; turning Sound on creates the audio context inside that click, and each action plays its own cue (dialog open 3 notes, close 2, section link 1). Sound output itself was not listened to.

Known and expected at this stage (superseded in part by Run 5): the hero, sections, and footer still use Classic shapes and a few hard-coded teal decorative colors (orbit rings, glows, status pill) until the R4 section restyle.

## Run 5 — 2026-11-25 (R4 batch 1: shared pieces and hero, automated)

Scope: pixel section headings with motif labels, pixel buttons, squared chips, and the pixel hero (status pill, title banner, halftone portrait, stats strip). Commits `f149f55` to `0a95be1`.

| Command | Result |
|---|---|
| `npm run lint` | Passed, 0 warnings |
| `npm test` | Passed, 28/28 (the new globe icon adds one grid test) |
| `npm run build` | Passed |
| Browser suite from Run 4 (same 12 runs: Classic, Day, Night × 1280/390/320 px, plus reduced motion) | **137 passed, 0 failed**: 0 axe violations, 0 CSP violations, 0 console errors, no horizontal scrolling |

New color pairs, measured before use (WCAG 2.x): vermilion label on the Day band 5.01:1, white on vermilion 5.63:1, navy on Night coral 6.71:1, coral on the Night band 6.28:1. Motif labels and section numbers are hidden from assistive technology, so headings read "Skills", "About", and so on.

Screenshots (headless Edge, reduced motion) were reviewed for Day and Night at 1280 and 390 px. Classic was checked to be unchanged: no motif labels, original headings, orbit rings, and the unfiltered photo. The halftone portrait is CSS-only over the unchanged `public/profile.jpg`.

Not covered yet: the remaining sections (Projects and the case-study dialog, Skills, About, Certifications, Résumé, Contact, footer) still carry Classic shapes and some hard-coded teal decoration; the moving technology list between the hero and About is unchanged.

## Run 6 — 2026-11-25 (R4 batch 2: Projects, automated)

Scope: pixel project cards and the case-study dialog (CSS only; markup, evidence, links, and dialog behavior unchanged). Commits `c80e54b` and `52f6a85`.

| Command | Result |
|---|---|
| `npm run lint` | Passed, 0 warnings |
| `npm test` | Passed, 28/28 |
| `npm run build` | Passed |
| Browser suite (Run 4's 12 runs, plus new dialog checks in the 9 runs without reduced motion) | **155 passed, 0 failed** |

New dialog checks, run in Classic, Day, and Night at 1280, 390, and 320 px: opening a case study from the keyboard moves focus inside the dialog; axe finds 0 violations in the open dialog; Escape closes it and focus returns to its "View case study" button.

Screenshots reviewed: the project grid (Day, 1280 px) and the open dialog (Day 1280 px, Night 390 px). Screenshots stay whole at 25:12. The Classic green window dot and teal glows are replaced in Pixel by vermilion, yellow, and cobalt; the projects' own screenshots keep their real colors as evidence.

Noted, not a regression: on the phone bottom sheet, headless Edge draws the dialog's reserved scrollbar space as a solid strip at the right edge. Classic shows the same strip, and phone browsers overlay their scrollbars, so it should not appear on a real phone; confirm during the R6 real-phone check.

## Run 7 — 2026-11-25 (R4 batch 3: Skills, About, technology strip, automated)

Scope: pixel Inventory (Skills), Adventurer card (About), and the moving technology strip; CSS only. Commits `96269d0`, `7a21bdb`, and `7433029`.

| Command | Result |
|---|---|
| `npm run lint` | Passed, 0 warnings |
| `npm test` | Passed, 28/28 |
| `npm run build` | Passed |
| Browser suite (as in Run 6) | **155 passed, 0 failed** |

Screenshots reviewed: Skills (Day 1280 and 390 px; the Backend tab at Night to confirm AI-Assisted cells), About (Day 1280, Night 390), and the strip (Night 1280).

- AI-Assisted marking: Built is a filled pixel circle and AI-Assisted a hollow pixel ring, with the same "Built / AI-Assisted" key; table cells still announce "Used", "AI-assisted", or "Not used".
- Layout decision: in Pixel, About's numbers tile is hidden because the hero stats strip already shows the same three counts; Classic keeps it. The counts are still computed from `src/content/*`.
- The Classic teal fills and glows in these components (the "Looking for" gradient, matrix dot glows, clock dots, marquee stars) are replaced in Pixel by cobalt, yellow, and navy.

Not covered yet: Certifications (Emblem case), Résumé (Save file), Contact, and footer.

## Run 8 — 2026-11-25 (R4 batch 4: Certifications, Résumé, Contact, footer, and a font fix; automated)

Scope: pixel Emblem case, Save file, footer rule, and a legibility fix for Pixelify Sans. Commits `096b4de`, `35cca36`, `afbdb79`, and `566fb9a`. This completes the R4 section restyle.

| Command | Result |
|---|---|
| `npm run lint` | Passed, 0 warnings |
| `npm test` | Passed, 28/28 |
| `npm run build` | Passed |
| Browser suite (as in Run 6, font check updated to the new family name) | **155 passed, 0 failed** |

Legibility defect found and fixed: at weights above about 500, Pixelify Sans closes its capital "C" so it reads as "O" ("Clive" looked like "Olive"; "CERTIFICATIONS" like "OERTIFIOATIONS"). A glyph sheet at weights 400, 500, 600, and 700 confirmed it. The pixel design now uses the same self-hosted files registered as "Pixelify Sans UI" with `font-weight: 400`, so bold requests clamp to 400, synthetic bold is off, and the hero name no longer sets per-letter weights in Pixel. Screenshots after the fix show "Clive Owen S. Benito" and "CERTIFICATIONS" correctly. The contact email and the footer copyright stay in their readable fonts (monospace and Plus Jakarta Sans), so the address and name can't be misread.

Other checks: exam-certification emblems are vermilion and course badges cobalt, each with a yellow verified tick that is not clipped; every Verify link is at least 44 px tall in Pixel; verification links and wording are unchanged.

Remaining before release (R6): sound audition and tuning (local test page), then the full manual set for Day and Night (NVDA, real phone including the dialog's scrollbar strip, 400% zoom, Windows animation setting, PageSpeed, Firefox; Safari/iOS if available).
