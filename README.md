# Portfolio

Personal portfolio website for Clive Owen S. Benito, a full-stack and front-end developer applying for internships.

The site presents selected projects, skills, certifications, and contact details for job applications. Every project claim is backed by repository evidence, with work clearly labeled as completed or in progress.

## Status

**Content and design complete; validation and deployment next.** All sections are built with verified content. The résumé download and the social-sharing image are pending. See [ROADMAP.md](ROADMAP.md) for the checklist.

## Version-one scope

Version one is a focused, static site with these sections:

- Home
- About
- Projects (evidence-backed case studies: CareerTrack, Pedalya, SmartFeather, and Pasa-Buy)
- Skills
- Résumé
- Certifications
- Contact

Version one deliberately has **no** backend, database, authentication, contact form, analytics, or CMS. Those are possible later additions only if they bring a clear benefit.

## Stack

Decided on 2026-11-21.

| Area | Choice |
|---|---|
| UI library | React |
| Language | TypeScript |
| Build tool | Vite |
| Styling | CSS Modules with a shared design-token layer (CSS custom properties); dark theme |
| Font | Plus Jakarta Sans (variable), self-hosted through `@fontsource-variable` |
| Linting | oxlint |
| Hosting | Vercel, with security headers set in `vercel.json` |

Runtime dependencies are limited to React, React DOM, and the font package.

## Requirements

- Responsive layout for mobile, tablet, and desktop.
- Semantic HTML and keyboard-accessible navigation with visible focus states.
- Reduced-motion support, good contrast, and readable typography.
- Optimized images, fast initial load, and search and social-sharing metadata.
- HTTPS and security headers (Content Security Policy, clickjacking protection, referrer policy) set through the host.
- No secrets or private personal information in the repository or deployed files.

## Setup

Requires Node.js 22.12 or newer (CI uses the version in `.nvmrc`).

```bash
npm install       # install dependencies from the lockfile
npm run dev       # start the dev server at http://localhost:5173
npm run lint      # lint with oxlint (warnings fail the check)
npm run build     # type-check with TypeScript, then build to dist/
npm run preview   # serve the production build locally
```

GitHub Actions runs `lint` and `build` on every push and pull request to `main`.

## Project structure

```
src/
  content/      Typed portfolio data: profile, projects, skills, certifications, sections
  components/   UI pieces, each with its own CSS Module
  lib/          Small helpers: scroll reveal, cursor spotlight, date formatting
  styles/       Design tokens (tokens.css) and global styles
  App.tsx       Page layout
public/         Favicon, profile photo, and project screenshots
docs/           Wireframes and design notes
vercel.json     Security headers for the Vercel deployment
```

## Updating content

Facts live in `src/content/`; no layout code needs to change.

- **Project:** edit `projects.ts`. Screenshots go in `public/projects/` (1600×768 JPEG, no private data).
- **Skill:** edit `skills.ts`, listing only the projects whose repositories show it.
- **Certification:** edit `certifications.ts` with the verification link, an `issuerMark` for the seal, and a `motif` (`network`, `code`, `database`, or `timeline`) for exam-based certifications.
- **Profile, contact, résumé:** edit `profile.ts`. Setting `links.resume.href` turns on the résumé download buttons.

Run `npm run lint` and `npm run build` before pushing.

## Copyright

© Clive Owen S. Benito. All rights reserved.

This repository is public so its code can be reviewed, but no license is granted. The code, text, résumé, images, and certificates may not be copied, modified, or redistributed without permission.
