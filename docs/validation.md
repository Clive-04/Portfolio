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

## Run 9 — 2026-11-25 (interface sound coverage, automated)

Reported by the owner: Skills, Certifications, and Contact buttons made no sound. Cause: the shared listener only handled section links, downloads, and dialogs. Fixed in `9c22aa3`, `528e620`, and `3af54bd`; the rule for which control plays which cue is now `src/lib/soundFor.ts` with unit tests.

| Command | Result |
|---|---|
| `npm run lint` | Passed, 0 warnings |
| `npm test` | Passed, 34/34 (6 new `soundFor` tests) |
| `npm run build` | Passed |
| Browser suite (as in Run 6) | **155 passed, 0 failed** |
| New click-through check: every control with sound on, counting scheduled notes (navigate 1, confirm 2, back 2, open 3, download 4) | **22 passed, 0 failed** |

Covered: sidebar and footer section links, Day/Night (no double cue), skill tabs by click and arrow keys (silent when the same tab is clicked), project Live and Code, opening, Next, and closing a case study, Credly and Verify, the résumé download, Contact Email/LinkedIn/GitHub, the technology-strip pause, the phone menu open/close, and two controls with sound off (silent). Two bugs found by this check and fixed: the phone menu cues were reversed, and Next played the dialog close and open cues on top of navigate.

## Run 10 — 2026-11-25 (more distinct sounds, automated)

Owner request: the sounds felt repetitive; links that open another tab and the Skills buttons should each sound different. Added three original cues in `5267ed5` (notes can now slide between pitches) and routed controls to them in `6149836`:

| Cue | Controls |
|---|---|
| external (upward sweep + sparkle) | LinkedIn, GitHub, Verify, Credly, project Live and Code |
| tab (soft dipping note) | Skill category tabs, by click or arrow keys |
| page (double tick) | Case-study Previous / Next |

| Command | Result |
|---|---|
| `npm run lint` | Passed, 0 warnings |
| `npm test` | Passed, 37/37 (new tests: the new cues differ from every other cue; new-tab links map to external) |
| `npm run build` | Passed |
| Browser suite (as in Run 6) | **155 passed, 0 failed** |
| Click-through check, now identifying each cue by its pitches rather than counting notes | **22 passed, 0 failed** |
| Sound lab in headless Edge | 0 errors |

How the cues sound has still not been judged by ear; the owner tunes them in the sound lab.

## Run 11 — 2026-11-25 (About icons, stronger hover, pixel favicon; automated)

Owner request before shipping: icons on the About section, a more noticeable hover on cards and buttons, and a favicon that matches the design. Commits `b303a2c`, `745dfa2`, `b1fb018`, and `b75c2fc`.

| Command | Result |
|---|---|
| `npm run lint` | Passed, 0 warnings |
| `npm test` | Passed, 45/45 (eight new icon grids) |
| `npm run build` | Passed; `dist/favicon.svg` present |
| Browser suite (as in Run 6) | **155 passed, 0 failed** |
| Sound click-through (as in Run 10) | **22 passed, 0 failed** |

- About (Pixel only, decorative, hidden from assistive technology): ID card, briefcase, map pin, and star icons, plus generic symbols on the focus chips (atom, TS block, bolt, accessibility figure). Icons were reviewed on a sheet at 16, 32, and 64 px; the first atom drawing was redrawn twice before it read clearly. Classic About was checked to be unchanged.
- Hover (Pixel only): cards lift 4 px onto an 8 px hard shadow with a cobalt keyline, also on keyboard focus inside a card; buttons and small controls lift 2 px onto a 4 px shadow. Screenshots mid-hover were reviewed in Day and Night; Night uses a mid-blue hover shadow because the near-black one was not visible on navy.
- Favicon: a 16 × 16 pixel "CB" tile in the approved palette, reviewed at 16, 32, and 64 px on light and dark browser tabs.

## Run 12 — 2026-11-25 (R6 manual release checks, by the owner)

Reported by Clive; recorded as stated, not re-run by Claude Code.

| Check (Pixel Day and Night) | Result |
|---|---|
| NVDA screen reader | Passed |
| Real phone, including the case-study sheet | Passed |
| 400% browser zoom | Passed |
| Windows "Animation effects" off (reduced motion) | Passed |
| PageSpeed Insights | Passed |
| Firefox | Not run: the owner does not have Firefox installed |
| Safari / iOS | Not run: no access |

Sound: the owner listened and found the cues too quiet (audible only at 60–80% system volume). Fixed in `5936825` (master level 0.05 → 0.15, triangle notes lifted 1.6×); a re-listen at about 30% is still to confirm. Layout: the About bio card had a large empty area under its text on wide screens; fixed in `d7a04ef` by moving Focus to a full-width row.

## Run 13 — 2026-11-25 (Pixel becomes the main design, automated)

Pixel is now the default for first-time visitors (`28e9fff`), and Classic is a "Switch to Classic" button instead of a "Pixel mode" switch. A saved Classic choice is still honoured. Preview image redrawn in `b0ff86e`.

| Command | Result |
|---|---|
| `npm run lint` | Passed, 0 warnings |
| `npm test` | Passed, 47/47 (defaults now Pixel; a saved Classic choice is kept; the pre-paint script matches `DEFAULT_DESIGN`) |
| `npm run build` | Passed |
| Browser suite, now with a first-visit run (nothing saved) at 1280, 390, and 320 px | **212 passed, 0 failed**; first visit lands on Pixel with the sound prompt |
| Design button, keyboard only | Enter switches Pixel → Classic → Pixel, focus stays on the button, its label updates, the choice is saved and survives a reload, 44 px tall |

Remaining: Firefox is untested on real hardware.

## Run 14 — 2026-11-25 (Day/Night diamond wipe, automated)

Owner request: replace the color fade when switching Day/Night. The new theme is now revealed through a diamond that grows from the pressed button in ten steps over 600 ms (View Transitions API); color transitions are switched off during the change so nothing fades.

| Check | Result |
|---|---|
| `npm run lint` / `npm test` / `npm run build` | Passed / 47 of 47 / Passed |
| Browser suite and sound click-through | **212 passed, 0 failed** and **22 passed, 0 failed** |
| Wipe, motion allowed (headless Edge) | One view transition with the `theme-diamond-wipe` animation (600 ms); color transitions `0s` during the switch; Night applied and saved; the switching flag is removed afterwards; 0 CSP violations, 0 errors |
| Wipe, reduced motion | No view transition; the switch is instant (no fade); Night applied and saved |
| Halfway screenshot | The diamond edge is visible part-way across the page |

Found during the check: the first version sized the diamond at 300vmax, so it covered the screen within one step; the radius is now computed from the button to the farthest screen corner. Browsers without View Transitions (including current Firefox) switch instantly. Automated Firefox checks are possible with Playwright's Firefox build if the owner approves downloading it.

## Run 15 — 2026-11-25 (scrolling pixel companion, local motion preview, automated)

Owner approved sprite sheet v7.2; this run covers the integration on `feature/pixel-companion` for the next checkpoint (local Day/Night motion preview). Not merged, pushed, or deployed. Headless Edge driven over the DevTools protocol (scratch script), dev server, 1280 × 800 unless noted.

| Check | Result |
|---|---|
| `npm run lint` / `npm test` / `npm run build` | Passed / 91 of 91 (19 new route tests) / Passed |
| Route at 1280 | Ledges found: hero/marquee edge, Projects, the Pasa-Buy card top, Skills, Résumé, Certifications, Contact, footer. Skipped as unsafe: About (no clear 64 px above), CareerTrack and the second card row (gap smaller than the sprite). Walks down where the lane is clear (Projects → card, Résumé → Certifications, Contact → footer); teleports elsewhere |
| Never covers content | Every route box is checked against every text line (6 px margin), link/button/control (8 px, for focus rings) and image (2 px). Card screenshot: feet on the card border, clear of the "Completed" badge and the intro text |
| Day / Night | Day: no rim needed. Night: 1-sprite-pixel light rim visible on the route and in the sidebar slot |
| Bottom of page | Teleports into the sidebar mark: "CB" tile hidden, thumbs-up sprite at 1× beside the name; brand link and name unchanged |
| Scrolling back up | 400 px up: slot plays the teleport out, "CB" returns exactly as before, the sprite reappears on the route |
| Fallbacks | 800 px wide, reduced motion (also at the bottom), and Classic: no sprite, no `data-companion`, "CB" visible. Live switch wide → narrow → wide stops and restarts cleanly |
| Keyboard / screen reader | Sprite is one empty `aria-hidden` element, not focusable; tab stops unchanged (52) |
| Case-study dialog | Opens as modal above the sprite (top element at the sprite's position is the dialog) |
| 125% display scaling | 3 device pixels per sprite pixel (2.4 CSS px), positions snapped to device pixels |
| Layout shift / overflow | CLS 0.0011 with and without the companion (already present before it); no horizontal overflow |
| Performance (same scripted scroll to the bottom and back, 2 runs each, baseline = commit 37999fe) | No long tasks either way. Script 96 → 109 ms, style 185 → 205 ms, all tasks 1468 → 1640 ms over ~15 s of scrolling. Route measure ≈ 5 ms, only on resize/layout change (debounced). JS bundle 88.45 → 94.96 kB gzip (sprite sheet inlined) |
| Console / CSP | 0 errors in every scenario |

Not yet checked: Firefox and Safari/iOS (not installed), a real screen reader, 320 px / 400% zoom (the companion is off below 56rem, so these fall under the narrow fallback). No teleport sound was added; the optional sound cue is still open.

## Run 16 — 2026-11-25 (companion stays docked; speech bubbles; automated)

Owner requests: once the companion reaches the name it stays there until the page is reloaded, and he introduces sections in speech bubbles. Same headless Edge setup as Run 15, 1280 × 800, Day and Night.

| Check | Result |
|---|---|
| `npm run lint` / `npm test` / `npm run build` | Passed / 94 of 94 (3 new bubble-placement tests; docking test now expects it to stay) / Passed |
| Stays docked | Docked at the bottom; still docked after scrolling back to the top, and after a narrow → wide restart of the companion. A reload starts him on the route again |
| Lines said (scroll top to bottom) | All 7 reachable: start, Projects, project card, Skills, Résumé, Certifications, Contact; each once per visit (back at the top, no repeat). About has no clear spot at this width; the footer line was dropped (he docks before reaching it) |
| Bubble never covers content | Checked at every change of the bubble (shown, moved): 0 overlaps with text lines, links, buttons, images, or focusable elements. It sits above his head, or to his left when text is above, or is skipped |
| Day / Night | Day: navy text on the surface colour with a navy keyline. Night: cream text on raised navy with the light keyline |
| Console / CSP | 0 errors |

Bubbles are `aria-hidden` like the sprite: they are flavour, and each section's own heading and intro already carry its content. Lines live in `src/content/companion.ts` and can be edited there.

## Run 17 — 2026-11-25 (companion actions, anchor placement, responsive route; automated)

Owner brief: section-specific actions instead of constant running or teleporting; placement attached to the page composition through measured anchors (top / ledge / below / beside / brand slot); responsive routes; annotated placement review before merging. Also covers the earlier card-ledge change (afcd01e). Headless Edge over the DevTools protocol, dev server. Not merged, pushed, or deployed.

| Check | Result |
|---|---|
| `npm run lint` / `npm test` / `npm run build` | Passed / 126 of 126 (new: anchor resolution, fallbacks, layouts) / Passed; JS 99.02 kB gzip (was 94.96) |
| Sprite (pixel-art-sprites review) | 23 clips, 79 frames, 24 × 32, 14 colours, 3.8 KB indexed PNG; actions reuse three poses with small props; each read at 1× (lens rounded and pouch moved to the hip after the 1× review) |
| Anchor plans (Day and Night identical) | Desktop 1280: 29 anchors → 9 top, 8 ledge, 9 below, 0 beside, 3 skipped; 26 route points, 7 teleports. Tablet 820: 7 / 8 / 7 / – / 7 skipped; 24 points. Phone 390: 4 / 8 / 6 / – / 11 skipped; 14 points. Annotated full-page captures in `docs/design/companion/placement/` |
| Never in front of content | Sprite box (real rendered size) clear of text (6 px), links and controls (12 px), images (2 px), other cards, and the content column edges; no horizontal overflow |
| Section actions (desktop) | Hero: tie then wave; About: sit; Projects: inspect; Résumé: document (after the settle fix below); Certifications (Night): polish and nod |
| Reactions | Night switch → lantern; Day switch → shield; sound on → music; résumé download → thumbs-up |
| Overlays | Case study open → he stops and takes notes; mobile menu open → hidden, back when closed |
| Dock | Desktop sidebar and phone top bar: thumbs-up replaces "CB" |
| Reduced motion | No companion; "CB" unchanged |
| Console | 0 site errors (Edge's own assistant script logs one unrelated error in headless) |

Found and fixed during the run: he rested between anchors when scrolling stopped mid-walk; he now finishes the walk to the nearest anchor in view once scrolling pauses for 0.6 s. He stood partly in front of the card above the "Based in" tile; placements now treat other cards as obstacles.

Not yet checked: Firefox, Safari/iOS, a real screen reader, the owner's own motion review.

Run 17 follow-up, same day (owner: "the companion is not on top of cards on the skills page"): the Skills anchor moved from the tabs-and-panel wrapper to the panel card, and a focusable card no longer blocks standing on its own border; instead he steps out of view while a keyboard focus ring would touch him. Desktop Day and Night: feet exactly on the panel's top border, pouch action played; with the panel focused by keyboard he is hidden, and back once focus moves away. Tablet and phone: the tabs sit directly on the panel, so he stands below it. Plans re-captured (desktop: 10 top, 8 ledge, 8 below, 3 skipped). 126 of 126 tests pass.

Run 17 follow-up 2, same day (owner: appear on the first card of each section, walk there, teleport to the next section's first card, until the last section): the route is now one stop per section (pickStops: first safe card, else next card, else heading) walked along as the reader scrolls (tour), with a teleport between sections. Headless Edge, reader-paced scroll top to bottom: desktop hero edge → About bio card → first project card (inspect) → Skills panel (pouch) → first Résumé block (document) → first certification card (polish) → Contact → docked; phone the same with Skills below its panel. 7 stops, 6 teleports at desktop, tablet, and phone. About sit plays when the reader pauses there. 127 of 127 tests pass.

Run 17 follow-up 3, 2026-11-26 (owner: walk briefly on top of the card, stop, teleport to the next section when scrolled, walk briefly again, stop and talk): each stop is now a timed 64 px walk on arrival, after which he stops; his line starts only once he is standing still. Arrivals (page load, section teleports, catch-up teleports) begin at the start of the short walk. The bubble can also extend right or sit to his right (new left-pointing tail), and the clear-view check only needs him fully visible (below the top bar on narrow screens), so lines are no longer lost near the top of the screen. At the bottom he docks only after finishing the last stop. Headless Edge, desktop Day, timeline at 50 ms resolution for every section: teleport → walk 59–63 px in about 0.9 s → stop → line (all 7 sections, Hero to Contact) → dock after the Contact line. 130 of 130 tests pass.

## Run 18 — 2026-11-26 (fast-scroll fixes, Contact goodbye, sidebar sizing; automated)

Owner brief: under fast scrolling the companion missed its card, text looked dragged into the next section, some text stayed hidden, and actions fell out of sync. Also: a Contact email-press and goodbye sequence, a sidebar sprite sized to the name, and regression coverage. Reproduced first with a DevTools-protocol harness (real wheel events, momentum trains, scrollbar-style jumps, Page Up/Down, Home/End, rapid reversals) against the dev server and the production build. Not merged, pushed, or deployed.

### Problems, root causes, fixes

| Problem | Reproduced? | Root cause | Fix |
|---|---|---|---|
| Text dragged into the next section | Yes: after a fast wheel or a jump to the bottom, "Hi, I'm Clive!" was still showing beside him at Contact | His speech bubble was deliberately carried across teleports (up to 6 s), so a line from one section rode into another | A line belongs to the stop where it was said; any teleport ends it. (Classic's large drifting section numbers also cross section edges by design; hidden in Pixel and left unchanged) |
| Misses his card / out of sync after fast scrolls | Yes: after 6 rapid Page Downs he was still at About while the reader was at Résumé; scrolling up from Certifications he lagged a section | Movement walked the route one teleport at a time, and each teleport committed to its destination before its 0.5 s departure, so a fast scroll became a queue of stale teleports (and stale arrival lines) | `nextMove()` derives what to do from the latest scroll position only: stay, finish the short walk, or teleport straight to the reader's stop however many sections were skipped, up or down. The destination is re-read after the departure; a scroll that skips more than one section skips the departure. One generation token owns him at a time (idle beats, actions, teleports, reactions, docking, dialog notes); any newer claim ends older sequences at their next frame |
| Feet off the card after re-measuring | Partly: measurements taken during a reveal included its 20 px `translate` | `getBoundingClientRect` includes in-flight animation transforms | When finite content animations are running, he re-measures as soon as they finish (`Animation.finished`), not after a delay |
| Text left hidden | Not reproduced: dense audits every 100 ms during and after fast input at 1280, 320, and 320 × 4× found no hidden, half-faded, or offset text | The reveal is one-way, but content that a jump carried past the viewport was never marked revealed (it only faded in when scrolled back to) | Content above the viewport is revealed too (IntersectionObserver entries above the viewport, plus one check per frame after scrolling), so returning never finds hidden text; the animation still has no forward fill |

### New behaviour

- Placement per section: top, below, beside (nearest clear spot on the card's ground line, within four sprite widths), else the heading ledge. Above/below are tried first everywhere; beside is a last resort on narrow screens.
- Contact: beside the Email button he faces it, presses (the button shows only its own pressed look through `data-companion-press`; no click, focus, or `mailto:`), steps back, waves, and teleports to the brand slot. Where there is no room beside Email he waves from the nearest safe spot and skips the press. Scrolling away cancels it and clears the press look. A visitor's own click on Email is never delayed or prevented (he gives a thumbs-up afterwards).
- Sidebar: the sprite is the largest whole number of device pixels per sprite pixel that keeps it no taller than the name (or the 36 px mark when the name is hidden), centred, pixelated; "CB" stays when nothing fits or the sheet cannot load.
- Reduced motion: a still figure near Contact, then a still sprite in the brand slot; no walking, pressing, waving, or teleporting.

### Results

| Check | Result |
|---|---|
| `npm run lint` / `npm test` / `npm run build` | Passed / 141 of 141 (new: `nextMove` across sections and directions, clamping, `stopStart`, beside along the ground line, `brandScale`) / Passed |
| `npm run qa:companion` (new browser suite, dev server) | **31 passed, 0 failed**: slow scroll, very fast wheel, momentum fling, scrollbar drag to the bottom, one update across several sections, Page Down × 6, Page Up × 4, End then Home, rapid reversal (each at 1280 and 320 px: on the reader's stop or docked, no bubble from another section, no section action out of place, no hidden or offset text, no overflow); placement after resizing; Contact press-wave-dock; the automatic press never clicks, focuses, or opens the Email link; cancelling the goodbye; brand slot at 1x, 2x, 125%, phone 3x, 400% zoom, tablet 1x ("CB" kept); reduced motion; Classic unchanged; no console errors |
| Before/after recording (same fling) | Companion stranded in an off-screen section or showing another section's line: before 81 of 152 samples (53%), after 15 of 151 (10%, all during half-second departures). `docs/design/companion/fast-scroll/` |
| Production build under the real CSP (`vercel.json` headers), desktop, tablet, 320 px, 400% zoom; Day and Night; reduced motion | 0 CSP violations, 0 console errors, no horizontal overflow, no hidden text in view, sprite `aria-hidden` with nothing focusable, tab stops unchanged |
| Layout shift | Desktop 0.0011 (as before). Tablet 0.022 and reduced motion 0.009 come from the technology marquee and hero content; Classic shifts more on the same scroll (0.038), so not from the companion |
| Placement captures | `docs/design/companion/placement-review.html` (desktop, tablet, phone; Day and Night; Contact frames; sidebar at actual size) |

Not checked: Firefox, Safari/iOS, a real screen reader, axe (not installed in this environment).

## Run 19 — 2026-11-26 (companion dialogue, Contact goodbye line, placement and reveal fixes; automated)

Owner brief:
- the Contact goodbye pressed Email, waved, and docked without his line;
- the opening line was missed on 390 and 320 px phones, and the Contact line at 820 and 320 px;
- all seven lines should play once per visit where a safe presentation is possible.

Also the rewritten lines (owner request, 2026-11-26: speak to the visitor while introducing the portfolio). Not merged, pushed, or deployed.

### Problems, root causes, fixes

| Problem | Root cause | Fix |
|---|---|---|
| Contact goodbye without his line | His line went through the ordinary "say it when standing still" path. Where the bubble had no clear spot beside him (820, 390, 320 px) it was silently dropped. At 390 px the Contact stop is the heading, which had no action, so the goodbye never ran there | The goodbye owns the line: (press) > line > about 2.6 s to read > step back > wave > line closes > dock. The Contact stop always plays the goodbye, wherever it is |
| Lines dropped when nothing beside him is clear | The bubble had four spots, all next to him, and all had to be clear of text | Order of preference: clear beside him; a clear spot touching him (tail pointing at him); beside him **over text** (above his head first); the nearest clear spot in view. Owner decision (2026-11-26): a bubble may cover text while he speaks; it never covers a link, control, or image |
| Contact line placed below him or far away (owner report, desktop and phone) | The clear-spot fallback picked the nearest clear area, which was below him or in the section heading row | Covered by the order above: the Contact line now sits above his head with its tail down at every width checked (1100–1920 px desktop, 820, 390, 320) |
| Bubble outline and tail invisible on the dark Contact panel in Day | The bubble used Day's dark border on a navy panel | On dark panels the bubble's outline and tail use the sprite's light rim colour (#9fb3d6) |
| Bubble could sit behind the phone top bar or cover a Contact button | Placement ignored the fixed top bar and the viewport; the Email and GitHub buttons are anchors (he stands beside them), so they were not bubble obstacles | Out-of-view areas and the top bar count as obstacles when he speaks; bubbles avoid every control, anchors included |
| Opening line missed on phones | The hero is taller than a phone screen, so his first stop (the technology strip) was below the fold and About took over before he could be seen | An "early" spot beside the "Open to internships" status, used only when the usual first stop is below the first screen |
| Opening bubble blinked out and back at 320 px during load | It was re-placed while the hero entrance was still moving content, and briefly found no spot | While he speaks, a re-placement that finds nothing keeps the line where it is if that spot is still in view and off every control |
| He stood 2–3 px off the status, or stopped part-way along a card, after some fast scrolls (intermittent) | He re-measured only after animations that were already running when he measured, and only after all of them (the status dot's 7 s pulse held back the hero's correction). Reveals that started later never triggered one, so his talk spot could come from content still 20 px off its place | He re-measures whenever any content animation ends (`animationend`) |
| `TypeError: Cannot read properties of undefined (reading 'blink')` in the production build at 320 px and 400% zoom; he then stopped following the route | A re-measure can produce a shorter route; `nextMove` read his old position index before it was clamped to the new route | `nextMove` clamps the position to the route (unit test added) |
| Two certification cards stayed blank after a fling at 820 px (a reader stopping there saw an empty band where their badge and title were) | A reveal waited until 8% of a card was above a line 8% up from the bottom; a tall card stopping just inside the screen never qualified | Reveal once any part is 40 px into view (`src/lib/useReveal.ts`; shared by Classic and Pixel) |
| The first browser-suite run on the dialogue change failed 4 placement checks | The suite rebuilt his route with the old rule while the engine had a new one | One shared `planRoute()` in `measure.ts` plans the route for the engine and the suite |

### Browser suite changes (`npm run qa:companion`)

- Layouts: desktop 1280 × 800, wide desktop 1536 × 864 (the owner's Contact report), tablet 820 × 1000, phone 390 × 844, phone 320 × 640.
- Scroll styles at every layout, alternating Day and Night: slow scroll, very fast wheel, momentum fling, scrollbar drag to the bottom, one update across several sections, Page Down × 6, Page Up × 4, End then Home, rapid reversal.
- He must reach the reader's stop within 8 s, checked every half second. Before, a single snapshot at 4 s failed whenever he was still finishing a walk, which made the result depend on machine load. At Contact, his two 8 px goodbye steps are accepted. At the bottom he has 12 s to finish the goodbye and dock.
- Read-through at every layout in Day and Night:
  - all seven lines, each once, in view, never over him or a control, pointing at him;
  - the Contact order: (press) > line > wave > line closes > dock, with the line up at least 2.5 s;
  - text a bubble briefly covers is reported, not failed.
- axe-core 4.14.1 (new dev dependency), WCAG 2.0, 2.1 and 2.2 A and AA rules, run on:
  - every layout in Day and Night with his opening line showing;
  - desktop at the bottom, docked;
  - Classic.
- Companion, bubble, and brand sprite inside `aria-hidden` and not focusable.
- The suite closes its browser when stopped with Ctrl+C.

### Results

| Check | Result |
|---|---|
| `npm run lint` | Passed, 0 warnings |
| `npm test` | Passed, 151 of 151. New tests cover the early stop, the Contact goodbye at any stop, the bubble fallbacks, and a route that became shorter |
| `npm run build` | Passed (JS 306.7 kB, 96.4 kB gzip) |
| `npm run qa:companion` (dev server, headless Edge) | **81 passed, 0 failed** on the final code. Breakdown: 45 scroll checks (9 styles × 5 layouts); 10 read-throughs (all seven lines at every layout in Day and Night; the Contact line briefly over text at wide desktop and 320 px, where it sits above his head); 12 axe scans with 0 violations; accessibility; resizing; the Contact press and goodbye; the press never clicks, focuses, or opens Email; cancelling the goodbye; 6 brand-slot sizes; reduced motion (says goodbye, no motion, docks); Classic; no console errors. Earlier runs during this work failed on the problems in the table above |
| Production build under the real CSP (`vercel.json` headers); desktop, tablet, 320 px, 400% zoom; Day and Night; reduced motion at desktop and 320 px (12 runs) | 0 CSP violations and 0 console errors in all 12 runs; no horizontal overflow; no hidden text in view; companion `aria-hidden` with nothing focusable; tab stops unchanged |
| Brand slot after the scripted fling | Docked in every run except tablet at 1× ("CB" kept by design: no whole-pixel sprite fits beside the name). 320 px Day reported "not docked" at 6 s; with a 10 s wait it docked (the goodbye with the Email press takes about 6 s) |
| Layout shift | As in Run 18: desktop 0.0011, tablet 0.022, reduced motion 0.009 |
| axe-core | 0 violations in every scan. `color-contrast` came back "needs review" on every page: axe cannot judge text over the patterned and layered backgrounds, so contrast is still the one recorded in earlier runs |

### Reported by the owner (not automated)

- 2026-11-26: on their own browser, "everything looks good now" after the Contact line moved above his head.

### Not checked

- Firefox, Safari/iOS, a real phone, and a real screen reader.
- Text contrast under the companion bubble on every panel; covered by the earlier contrast work, not re-measured here.

## Run 20 — 2026-11-26 (desktop room beside Email, owner decisions, test-browser fix; automated)

Owner decisions (2026-11-26):
1. Make a small Pixel-only desktop Contact layout change so the companion has room beside Email: **approved**.
2. Tablet at 1× density, where no whole-pixel sprite fits beside the name: **keep "CB"** (no change).
3. Review screenshots and recordings: **keep a small final set**, and leave the rest out of the repository's history.

### Changes

| Change | Detail |
|---|---|
| Room beside Email (Pixel, 56rem and wider) | 5rem more space after "Email me". He now stands between Email and LinkedIn and presses Email at every desktop width checked: 920, 1100, 1280 (and 1280 at 125%), 1366, 1440, 1536, 1920 px. Tablet, phone, and Classic are unchanged |
| Review images | `docs/design/companion/` went from 8.3 MB to 1.3 MB: the approved sprite review sheet plus `final/` (nine captures, about 100 KB, with a README). The placement review and the fast-scroll recording were removed from the branch's history as well as its files |
| Browser suite: test browser | Runs 3, 7, 9, and 13 during this work failed intermittently: he stopped part-way along a card and his lines stayed silent. Cause: in a fresh Edge profile, an installed extension sometimes opened its welcome tab in front of the test page. A background tab gets no animation frames, so his walk paused. The suite now starts Edge with extensions and first-run pages disabled, closes any other tab before each page load, and stops with an error if its page is ever in the background. This corrects Run 19, which put those failures down to measuring before reveals: that fix stands on its own, but it was not their cause |
| Browser suite: brand slot | Waits up to 15 s for docking. Desktop now plays the full goodbye with the Email press (about 6 s) before docking |

### Results

| Check | Result |
|---|---|
| `npm run lint` | Passed, 0 warnings |
| `npm test` | Passed, 152 of 152 |
| `npm run build` | Passed (JS 307.2 kB, 96.5 kB gzip) |
| `npm run qa:companion` (dev server, headless Edge; test page confirmed in front at 61 frames per second) | **81 passed, 0 failed**. Desktop and wide desktop read-throughs: press > line > wave > closes > dock |
| Production build under the real CSP (`vercel.json` headers); desktop, tablet, 320 px, 400% zoom; Day and Night; reduced motion (12 runs) | 0 CSP violations, 0 console errors, no horizontal overflow, no hidden text in view, companion `aria-hidden` with nothing focusable, tab stops unchanged. Docked in every run except tablet at 1× ("CB" kept, decision 2) |
| Layout shift | Unchanged: desktop 0.0011, tablet 0.022, reduced motion 0.009 |

### Not checked

Firefox, Safari/iOS, a real phone, and a real screen reader.

## Run 21 — 2026-11-26 (Contact gap closes after the companion docks; automated)

Owner report: once the companion teleported to the sidebar, the space after "Email me" (Run 20) looked like an awkward gap between the three buttons. Owner's choice, from three options: keep the layout and close the gap after he docks.

### Change

- The engine marks the page `html[data-companion="tour"]` once his sprite sheet has loaded (not with reduced motion, not when he is already docked), then re-plans around the new layout. It becomes `sidebar` when he docks.
- The 5rem space after Email (Pixel, 56rem and wider) exists only while `tour` is set. When he docks, LinkedIn and GitHub step back in a 300 ms, three-step slide (instant with reduced motion).
- No gap ever opens:
  - in Classic;
  - with reduced motion (he does not press there);
  - if the sprite sheet cannot load;
  - on tablet and phone.

### Results

| Check | Result |
|---|---|
| Gap, measured in headless Edge | Pixel 1280 and 1920 px: 92 px while he tours, he presses Email, 12 px (the normal spacing) after he docks. Reduced motion, Classic, tablet 820 px: 12 px throughout |
| `npm run lint` / `npm test` / `npm run build` | Passed / 152 of 152 / Passed (JS 307.2 kB, 96.5 kB gzip) |
| `npm run qa:companion` | **81 passed, 0 failed** |
| Production build under the real CSP (12 runs, as in Run 20) | 0 CSP violations and 0 console errors in every run; no overflow, no hidden text; tab stops unchanged; docked everywhere except tablet at 1× ("CB" kept) |
| Layout shift | Desktop 0.0022 (was 0.0011; the buttons stepping back after he docks, well under the 0.1 "good" threshold). Tablet 0.022 and reduced motion 0.009 unchanged |

### Not checked

Firefox, Safari/iOS, a real phone, and a real screen reader.
