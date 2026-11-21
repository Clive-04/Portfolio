# Portfolio

Personal portfolio website for Clive, an aspiring software developer.

The site presents selected projects, skills, certifications, and contact details for job applications. Every project claim is meant to be backed by evidence, with work clearly labeled as implemented, in progress, or planned.

## Status

**Planning complete.** Positioning, stack, and project evidence are settled; the app has not been scaffolded yet. See [ROADMAP.md](ROADMAP.md) for the checklist.

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

Setup instructions will be added once the project is scaffolded.

## Copyright

© Clive. All rights reserved.

This repository is public so its code can be reviewed, but no license is granted. The code, text, résumé, images, and certificates may not be copied, modified, or redistributed without permission.
