# Portfolio

Personal portfolio website for Clive, an aspiring software developer.

The site presents selected projects, skills, certifications, and contact details for job applications. Every project claim is meant to be backed by evidence, with work clearly labeled as implemented, in progress, or planned.

## Status

**In development.** The frontend foundation is built; section content is in progress. See [ROADMAP.md](ROADMAP.md) for the checklist.

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
| Styling | CSS Modules with a shared design-token layer (CSS custom properties) |
| Hosting | Vercel, with security headers set in `vercel.json` |

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
  content/      Typed portfolio data (profile, projects, certifications, sections)
  components/   Reusable UI pieces, each with its own CSS Module
  styles/       Design tokens and global styles
  App.tsx       Page layout
vercel.json     Security headers for the Vercel deployment
```

To update a project or add a certification, edit the matching file in `src/content/`. No layout code needs to change.

## Copyright

© Clive. All rights reserved.

This repository is public so its code can be reviewed, but no license is granted. The code, text, résumé, images, and certificates may not be copied, modified, or redistributed without permission.
