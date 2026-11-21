# Wireframes

Low-fidelity layouts for version one (Phase 2). The site is a single page; each section below is a band in that page. Desktop is shown; the mobile notes describe how each band collapses at narrow widths (below 48rem / 768px).

Visual tokens live in `src/styles/tokens.css`. These wireframes describe structure only.

## Changes since approval (2026-11-22)

The wireframes below were approved on 2026-11-22. The built site has since changed in these ways; where they differ, the code is the source of truth.

- **Theme:** dark pine-charcoal theme built on Figma's "Mountain mist" palette, with a brightened teal accent (`#2ec4b0`) and dark text on teal fills. All text pairs measured at WCAG AA.
- **Header:** active-section highlight, reading-progress line, Contact as a call-to-action button, and an animated mobile menu.
- **Hero:** the name reacts letter by letter to the pointer (variable font weight); a title line ("Full-stack & front-end developer") and a first-person headline; the side card was replaced by a portrait with decorative orbit rings.
- **Tech ticker:** a two-row strip below the hero drifts slowly (top row left, bottom row right), with a pause button; still under reduced motion.
- **About:** a bento grid (bio, "Looking for", Manila with a live clock, stats, focus) instead of two columns.
- **Projects:** screenshot covers; case studies open in a dialog that morphs from the card (View Transitions), not by expanding in place. The dialog has a top bar with a counter, a browser-framed screenshot, a story timeline, icon lists, Previous/Next, and independently scrolling columns on wide screens.
- **Skills:** category tabs plus a skill × project matrix instead of capability cards.
- **Résumé:** Education and Organization only, plus the pending download.
- **Certifications:** a summary strip, credential cards with issuer seals and topic watermarks, and a compact wall of Cisco Networking Academy course badges.
- **Contact:** LinkedIn and GitHub buttons use the real logos.
- **Motion:** scroll reveals, cursor spotlight on cards, and film-grain texture; reduced motion turns movement off.

## Page order

```
Header (sticky) → Hero → Tech ticker → About → Projects → Skills → Résumé → Certifications → Contact → Footer
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

Case study: "View case study" (or a click on the cover) opens a dialog. The card morphs into it with a View Transition; browsers without View Transitions get a scale-and-fade, and reduced motion opens it instantly.

```
┌────────────────────────────── dialog ──────────────────────────────────(×)┐
│ ┌─ left (stays in place) ──────────┐ │ PROBLEM        ...                   │
│ │ [ screenshot, 16:10 ]            │ │ MY ROLE        ...                   │
│ │ SOLO PROJECT                     │ │ COLLABORATION  ...                   │
│ │ CareerTrack          [Completed] │ │ ┌ Features ──────────────────────┐   │
│ │ summary                          │ │ │ • ...                          │   │
│ │ [Visit live site ↗] [View code ↗]│ │ └────────────────────────────────┘   │
│ │ STACK  [tag] [tag] [tag] ...     │ │ ┌ Testing evidence ┐ ┌ Limitations ┐ │
│ └──────────────────────────────────┘ │                                      │
└────────────────────────────────────────────────────────────────────────────┘
```

- Native `<dialog>` with `showModal()`: focus stays inside, Escape and a backdrop click close it, and focus returns to the button.
- Sections with no data (for example, empty testing evidence) are left out instead of showing an empty heading.
- Mobile: a full-width sheet that rises from the bottom, in one column.
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
