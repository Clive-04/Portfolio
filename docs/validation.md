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

## Not yet done — needs a person or a device

- [ ] **NVDA (Windows):** headings list (H key), the skills tabs and table, the case-study title on open, and "opens in a new tab" announcements.
- [ ] **Real phone:** menu, bottom-sheet case study, skills table, résumé download, and overall smoothness of the motion.
- [ ] **Firefox** (not installed on the test machine) and **Safari/iOS**.
- [ ] **Windows "Show animations" off:** confirm that reduced motion applies on a real setting, not just the emulation.
- [ ] **LinkedIn link:** open it by hand.
- [ ] **Browser zoom to 400%** on a laptop: confirm that nothing is cut off.

## Open items found

- ~~`github.com/Clive-04/Pasa-Buy` returns 404.~~ Resolved on 2026-11-22: the owner made the repository public again, and the link returns 200.
