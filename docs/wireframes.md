# Wireframes

Low-fidelity layouts for version one (Phase 2). The site is a single page; each section below is a band in that page. Desktop is shown; the mobile notes describe how each band collapses at narrow widths (below 48rem / 768px).

Visual tokens live in `src/styles/tokens.css`. These wireframes describe structure only.

## Page order

```
Header (sticky) → Hero → About → Projects → Skills → Résumé → Certifications → Contact → Footer
```

## Header

```
┌──────────────────────────────────────────────────────────────────────┐
│ Clive                 About  Projects  Skills  Résumé  Certs  Contact │
└──────────────────────────────────────────────────────────────────────┘
```

- Mobile: `Clive ............ [☰ Menu]`. The menu slides down below the header and closes on link click or Escape.
- A "Skip to content" link appears on the first Tab press.

## Hero

```
  JUNIOR FULL-STACK DEVELOPER INTERN · JUNIOR FRONT-END DEVELOPER INTERN
  Hi, I'm Clive.
  Junior developer who turns requirements into working web
  applications, from responsive frontends to tested APIs.
  React, TypeScript, Python (FastAPI), and PHP (Laravel, CodeIgniter).

  [ View projects ]  [ Download résumé ]   ← résumé button only when the file exists
```

- Left-aligned text, max width about 40rem; no hero image in version one.
- Mobile: same stack; buttons wrap.

## About

```
┌───────────────────────────────────────┬──────────────────────────────┐
│ Two or three short paragraphs:        │ Currently                    │
│ who I am, what I build, how I work    │  Looking for  Internships    │
│ (requirements → build → test → docs). │  Focus        React + TS     │
│                                       │  Learning     ...            │
└───────────────────────────────────────┴──────────────────────────────┘
```

- Desktop: text column about 2/3, fact list about 1/3.
- Mobile: the fact list moves below the text.

## Projects

Collapsed (default), two columns on desktop:

```
┌─ CareerTrack ─────────── [Completed] ┐ ┌─ Pasa-Buy ───────────── [Completed] ┐
│ Full-stack job-search workspace with │ │ Community platform to request or    │
│ AI résumé analysis.                  │ │ deliver nearby items.               │
│ Solo project                         │ │ With one collaborator               │
│ [Next.js] [React] [FastAPI] [+5]     │ │ [PHP] [CodeIgniter 4] [MySQL] [+2]  │
│ [Live ↗] [Code ↗]    [Case study ▾]  │ │ [Code ↗]             [Case study ▾] │
└──────────────────────────────────────┘ └─────────────────────────────────────┘
┌─ Pedalya ─────────── [In progress] ┐ ┌─ SmartFeather ───────── [Completed] ┐
│ ...                                  │ │ ...                                 │
└──────────────────────────────────────┘ └─────────────────────────────────────┘
```

Expanded: the card spans the full row so the details have room.

```
┌─ CareerTrack ──────────────────────────────────────────────── [Completed] ┐
│ Full-stack job-search workspace with AI résumé analysis.                  │
│ [Live ↗] [Code ↗]                                       [Case study ▴]   │
├───────────────────────────────────────────────────────────────────────────┤
│ [ screenshot, 16:10 ]          │ Problem       ...                          │
│                                │ My role       ...                          │
│                                │ Collaboration ...                          │
│                                │ Stack         [all technologies]           │
├───────────────────────────────────────────────────────────────────────────┤
│ Features          • ...  • ...  • ...                                     │
│ Testing evidence  • ...  • ...                                            │
│ Limitations       • ...                                                   │
└───────────────────────────────────────────────────────────────────────────┘
```

- The toggle is a real `<button>` with `aria-expanded` and `aria-controls`; the details are hidden from screen readers and the tab order when collapsed.
- Opening uses a short height and opacity transition; it switches instantly under reduced motion.
- Order: CareerTrack, Pasa-Buy, Pedalya, SmartFeather (strongest full-stack evidence first).
- Sections with no data (for example, empty testing evidence) are left out instead of showing an empty heading.
- Mobile: one column; expanded details stack vertically, with the screenshot on top.

## Skills

Capability groups instead of skill bars. Each group lists technologies and the projects that prove them.

```
┌─ Frontend ───────────────┐ ┌─ Backend ────────────────┐ ┌─ Databases & APIs ───────┐
│ React · Next.js · TS     │ │ FastAPI · Laravel ·      │ │ PostgreSQL · MySQL ·     │
│ Blade · CSS · JavaScript │ │ CodeIgniter              │ │ SQLAlchemy · REST        │
│ Used in: CareerTrack,    │ │ Used in: CareerTrack,    │ │ Used in: CareerTrack,    │
│ Pedalya, SmartFeather    │ │ Pasa-Buy                 │ │ Pasa-Buy                 │
└──────────────────────────┘ └──────────────────────────┘ └──────────────────────────┘
┌─ Testing ────────────────┐ ┌─ UI/UX & responsive ─────┐ ┌─ Docs & AI tools ────────┐
│ ...                      │ │ ...                      │ │ ...                      │
└──────────────────────────┘ └──────────────────────────┘ └──────────────────────────┘
```

- Desktop: three columns. Tablet: two. Mobile: one.
- "Used in" names come from `projects.ts`, so skills and projects can't drift apart.

## Résumé

```
  A short summary: education, focus, and what the PDF contains.
  [ Download résumé (PDF) ]       ← or a "Pending" note until the file is ready
```

## Certifications

```
┌──────────────────────────────────────────────────────────────────────┐
│ Certification name                                   Issued Mon YYYY │
│ Issuer · Skills: ..., ...                                [Verify ↗]  │
└──────────────────────────────────────────────────────────────────────┘
```

- A one-column list; only entries with `published: true` appear.
- With no published entries, the section shows a "Pending" note.

## Contact

```
  Open to internship opportunities. The fastest way to reach me is email.
  [ Email ]  [ GitHub ↗ ]  [ LinkedIn ↗ ]     ← each shown only when confirmed
```

## Footer

```
  © 2026 Clive. All rights reserved.                         Back to top
```

## Screenshot style

- Real screens from each project, light UI, with no private data (names, emails, uploads).
- 16:10 crop without a browser frame; one desktop screenshot per project in version one.
- Exported as WebP, about 1600px wide, lazy-loaded, with descriptive alt text.
