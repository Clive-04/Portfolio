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
