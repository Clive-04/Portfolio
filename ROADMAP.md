# Roadmap

This is the working checklist for version one. It follows the phases in the portfolio plan and is updated as work is finished.

## Positioning

- **Target roles:** Junior Full-Stack Developer Intern and Junior Front-end Developer Intern.
- **Title line:** Full-stack & front-end developer.
- **Headline:** I turn requirements into working web applications, from responsive frontends to tested APIs.
- **Status pill:** Open to internships.

## Projects in version one

| Project | Type | Role | Repository | Live |
|---|---|---|---|---|
| CareerTrack | Solo project | Full stack: Next.js frontend, FastAPI backend, AI résumé analysis, security hardening, tests, deployment | [Clive-04/CareerTrack](https://github.com/Clive-04/CareerTrack) | [career-track-bice.vercel.app](https://career-track-bice.vercel.app/) |
| Pasa-Buy | Client project, one collaborator | Frontend and most backend features; the collaborator built the core auth and request backend | [Clive-04/Pasa-Buy](https://github.com/Clive-04/Pasa-Buy) (history in [Pasa-Buy-Project](https://github.com/Clive-04/Pasa-Buy-Project)) | — |
| Pedalya | Team project | Customer-side frontend and a k6 load test; teammates did backend integration and tests | [Alcoreza/Pedalya](https://github.com/Alcoreza/Pedalya) | — |
| SmartFeather | Capstone, team of four | Manager and admin frontend, built with one groupmate | [Alcoreza/SmartFeather](https://github.com/Alcoreza/SmartFeather) | [smartfeather.org](https://smartfeather.org/) |

## Content still pending

- [x] Résumé PDF published at `public/Clive-Owen-Benito-Resume.pdf` (2026-11-22). By the owner's choice it is the full version, including phone, street address, and school email. Metadata checked: author name and template title only.
- [x] Social-sharing image (`public/og-image.jpg`, 1200×630) with `og:url`, `og:image` and canonical URL set to the production address.
- [ ] Higher-resolution profile photo (600px or larger); the current one is 299px and looks slightly soft on high-density screens.
- [x] Certifications with Credly verification links (Certiport for IT Specialist – Databases).
- [x] LinkedIn URL and public contact email.
- [x] Project screenshots for CareerTrack, Pedalya, and SmartFeather. Pasa-Buy has none (not deployed).

## Before sharing the project repositories widely

These are outside this repository, but the portfolio links to them.

- [ ] SmartFeather: the repository owner should complete the security cleanup reported privately.
- [ ] Pasa-Buy: review committed user uploads and team photos, and remove anything that should not be public.
- [ ] SmartFeather: replace the default Laravel README with a project description.

## Phase checklist

- [x] Phase 0: target roles, headline, and stack decided.
- [x] Phase 1: evidence gathered for all four projects.
- [x] Phase 2: wireframes in [docs/wireframes.md](docs/wireframes.md) approved on 2026-11-22. Later design changes are listed at the top of that file.
- [x] Phase 3: Vite, React, and TypeScript scaffold; layout; navigation; design tokens; base components; typed content model; CI workflow; `vercel.json` security headers.
- [x] Phase 4: all sections built with verified content, plus page metadata.
- [x] Design iterations: dark theme, case-study dialog, bento About, skills matrix, certification redesign, motion and hover polish (see the changes list in the wireframes file).
- [x] Phase 5: keyboard, screen-reader, responsive, reduced-motion, contrast, link, and performance checks across browsers. Completed on 2026-11-22: 48/48 automated checks in Edge and Chrome; NVDA, real phone, 400% zoom and the Windows animation setting checked by hand; PageSpeed Insights 100 in all four categories on mobile and desktop. Firefox and Safari/iOS were skipped. See [docs/validation.md](docs/validation.md).
- [ ] Phase 6: deploy to Vercel; verify HTTPS, security headers, and the public URL; add the sharing image; put the URL on the résumé and profiles. Deployed on 2026-11-22 to https://clive-benito.vercel.app/ (Git-connected: every push to `main` redeploys). HTTPS, the HTTP→HTTPS redirect, all six security headers, and the sharing image are verified. Still to do: put the URL on the résumé, LinkedIn, and the GitHub profile.

## Validation

- `npm run lint` and `npm run build` must pass before each push.
- GitHub Actions runs both on every push and pull request to `main` (first run passed on 2026-11-22).
