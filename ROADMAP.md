# Roadmap

This is the working checklist for version one. It follows the phases in the portfolio plan and is updated as work is finished.

## Positioning

- **Target roles:** Junior Full-Stack Developer Intern and Junior Front-end Developer Intern.
- **Headline:** Junior developer who turns requirements into working web applications, from responsive frontends to tested APIs.
- **Supporting line:** React, TypeScript, Python (FastAPI), and PHP (Laravel, CodeIgniter).

## Projects in version one

| Project | Role | Collaboration | Repository | Live |
|---|---|---|---|---|
| CareerTrack | Full stack: Next.js frontend, FastAPI backend, AI résumé analysis, security hardening, tests | Solo | [Clive-04/CareerTrack](https://github.com/Clive-04/CareerTrack) | [career-track-bice.vercel.app](https://career-track-bice.vercel.app/) |
| Pasa-Buy | Frontend and most backend features (profiles, messaging, wallet, search, ratings) | One collaborator built the core auth and request backend | [Clive-04/Pasa-Buy](https://github.com/Clive-04/Pasa-Buy) (history in [Pasa-Buy-Project](https://github.com/Clive-04/Pasa-Buy-Project)) | — |
| Pedalya | Customer-side frontend and a k6 load test | Team project; backend integration and tests by teammates | [Alcoreza/Pedalya](https://github.com/Alcoreza/Pedalya) | — |
| SmartFeather | Manager and admin frontend | Built with one groupmate within a larger team | [Alcoreza/SmartFeather](https://github.com/Alcoreza/SmartFeather) | — |

The Projects page shows all four. The Home page highlights CareerTrack and Pasa-Buy as the strongest full-stack evidence, with Pedalya as the frontend example.

## Content still pending

- [ ] Public résumé PDF without phone number or home address (metadata checked).
- [x] Certifications: name, issuer, and dates added. Cisco Networking Academy entries are labelled as course badges.
- [x] Public verification links for certifications: Credly badge pages, and Certiport for IT Specialist – Databases.
- [x] LinkedIn URL.
- [x] Public contact email.
- [x] Project screenshots for CareerTrack, Pedalya, and SmartFeather. Pasa-Buy has none (not deployed).
- [ ] Social-sharing image, added once the production URL exists.

Sections without content stay visible and are marked as pending instead of being filled with placeholder claims.

## Before linking the project repositories

- [ ] Review each linked repository for files that should not be public, and clean them up.
- [ ] SmartFeather: replace the default Laravel README with a project description.

## Phase checklist

- [x] Phase 0: target roles, headline, and stack decided.
- [x] Phase 1: evidence gathered for all four projects.
- [x] Phase 2: wireframes in [docs/wireframes.md](docs/wireframes.md) approved on 2026-11-22 (projects use expandable case-study cards). Colour palette: Figma "Mountain mist", checked for contrast and against the motion and token design notes.
- [x] Phase 3: Vite, React, and TypeScript scaffold; layout; navigation; design tokens; base components; typed content model; CI workflow; `vercel.json` security headers.
- [x] Phase 4: Home, About, Projects (expandable case studies), Skills, Résumé, Certifications, and Contact sections, plus page metadata. The résumé download and social image stay pending until their files exist.
- [ ] Phase 5: keyboard, responsive, reduced-motion, contrast, link, and build/lint checks.
- [ ] Phase 6: deploy to Vercel with security headers in `vercel.json`; verify the public URL.

## Validation

- `npm run build` and `npm run lint` must pass before each merge.
- GitHub Actions runs both on every push and pull request to `main`.
