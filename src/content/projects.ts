import type { Project } from './types'

/**
 * Every claim here was checked against the project's repository
 * history on 2026-11-21/22 (Pasa-Buy re-checked 2026-11-25 against
 * Clive-04/Pasa-Buy main 9b29641 and its live demo). Update only after
 * verified milestones.
 */
export const projects: Project[] = [
  {
    slug: 'careertrack',
    title: 'CareerTrack',
    summary: 'A full-stack workspace for managing a job search, with AI-assisted résumé analysis.',
    teamLabel: 'Solo project',
    problem:
      'Job seekers track applications, interviews, résumés, and skills across scattered notes and spreadsheets.',
    role: 'Designed and built the entire application: frontend, API, database, AI features, security, tests, and deployment.',
    collaboration: 'Solo project.',
    status: 'completed',
    featured: true,
    stack: [
      { name: 'Next.js', evidence: 'confirmed' },
      { name: 'React', evidence: 'confirmed' },
      { name: 'TypeScript', evidence: 'confirmed' },
      { name: 'Tailwind CSS', evidence: 'confirmed' },
      { name: 'FastAPI', evidence: 'confirmed' },
      { name: 'SQLAlchemy', evidence: 'confirmed' },
      { name: 'PostgreSQL', evidence: 'confirmed' },
      { name: 'Supabase', evidence: 'confirmed' },
      { name: 'Gemini API', evidence: 'confirmed' },
      { name: 'Docker', evidence: 'confirmed' },
    ],
    features: [
      'Jobs, applications, interviews, résumés, and skills management',
      'AI résumé analysis against job requirements, with missing skills and improvement suggestions',
      'Cookie-based JWT authentication with CSRF protection and protected routes',
      'Responsive workspace with a public landing page',
    ],
    validation: [
      'Component tests with Vitest and end-to-end tests with Playwright on desktop and mobile',
      'Backend test suite',
      'Dedicated security-hardening phase; the live site serves CSP, HSTS, and anti-framing headers',
    ],
    links: {
      repository: 'https://github.com/Clive-04/CareerTrack',
      live: 'https://career-track-bice.vercel.app/',
    },
    screenshots: [
      {
        src: '/projects/careertrack.webp',
        alt: 'CareerTrack landing page: the headline “Organize your job search” beside a dashboard preview with application counts and an AI résumé match score.',
        width: 1600,
        height: 768,
      },
    ],
    limitations: ['The backend runs on a free hosting tier, so the first request after idle can be slow.'],
  },
  {
    slug: 'pasa-buy',
    title: 'Pasa-Buy',
    summary: 'A community errand app: neighbors post what they need from nearby stores, and runners buy and deliver it.',
    teamLabel: 'Client project · with one collaborator',
    problem: 'People need a simple way to ask others to buy or deliver items and to coordinate those errands.',
    role: 'Built the frontend and most backend features: profiles, messaging with attachments, notifications, wallet, user search, ratings, and referrals. Later led an AI-assisted hardening and deployment pass: receipt-based price approval, real-time chat, admin tools, security, automated tests, CI, and deployment.',
    collaboration:
      'Client project, built with one collaborator, who wrote the core authentication and request backend. The later hardening pass was carried out with AI coding agents (Claude Code and Codex) under my direction and review. The repository was re-created after completion, so the original history is kept in a separate repository.',
    status: 'completed',
    featured: true,
    stack: [
      { name: 'PHP', evidence: 'confirmed' },
      { name: 'CodeIgniter 4', evidence: 'confirmed' },
      { name: 'MySQL', evidence: 'confirmed' },
      { name: 'JavaScript', evidence: 'confirmed' },
      { name: 'CSS', evidence: 'confirmed' },
      // Added in the AI-assisted hardening pass (directed and reviewed, not hand-written).
      { name: 'PHPUnit', evidence: 'qualified' },
      { name: 'TalkJS', evidence: 'qualified' },
      { name: 'Xendit (test mode)', evidence: 'qualified' },
      { name: 'Turbo', evidence: 'qualified' },
      { name: 'GitHub Actions', evidence: 'qualified' },
    ],
    features: [
      'Post, browse, filter, and accept errands, with a step-by-step status tracker',
      'Receipt-backed approval of the actual price before any payment, and a wallet with a full ledger',
      'Real-time chat with block, report, and an admin moderation queue',
      'Admin dashboard with charts, user suspension, request filters, and CSV export',
    ],
    validation: [
      '233 automated PHPUnit tests, including concurrency races for payments and price approval',
      'GitHub Actions CI on PHP 8.2 and 8.3 against MySQL 8 and MariaDB 10.6',
      'Staging rehearsals of fresh install, upgrade, backup restore, and rollback',
      'Content-Security-Policy with no inline scripts, verified with zero violations',
    ],
    links: {
      repository: 'https://github.com/Clive-04/Pasa-Buy',
      history: 'https://github.com/Clive-04/Pasa-Buy-Project',
      live: 'https://pasa-buy.infinityfree.io/',
    },
    screenshots: [
      {
        src: '/projects/pasa-buy.webp',
        alt: 'Pasa-Buy log-in page: the headline “Errands done by your neighbours” beside a store-to-home delivery illustration and the log-in form.',
        width: 1600,
        height: 768,
      },
    ],
    limitations: [
      'Runs as a demo on free hosting: payments use test mode and wallet credits are simulated.',
      'The free host blocks incoming webhooks, so top-ups are confirmed with a “Check payment” step.',
    ],
  },
  {
    slug: 'pedalya',
    title: 'Pedalya',
    summary: 'A bike-repair booking system: choose a service, schedule it, pay, and follow the repair.',
    teamLabel: 'Team project · customer frontend',
    problem: 'Repair-shop customers need to book services, pay, and follow repair progress without calling the shop.',
    role: 'Designed and built the customer-facing frontend: booking flow, bookings, repair tracking, payment preview, dashboard, profile, and responsive navigation. Wrote a k6 load test.',
    collaboration:
      'Team project. Teammates integrated the frontend with the Laravel backend and payment provider, and wrote the automated tests.',
    status: 'in-progress',
    featured: true,
    stack: [
      { name: 'Laravel', evidence: 'confirmed' },
      { name: 'Blade', evidence: 'confirmed' },
      { name: 'JavaScript', evidence: 'confirmed' },
      { name: 'CSS', evidence: 'confirmed' },
      { name: 'Vite', evidence: 'confirmed' },
      { name: 'k6', evidence: 'confirmed' },
    ],
    features: [
      'Multi-step booking: service, schedule, review, and confirmation',
      'Bookings list, booking detail, and repair tracking pages',
      'Payment preview and result pages',
      'Customer dashboard and profile',
    ],
    validation: ['k6 load test ramping to 10 virtual users with pass/fail thresholds'],
    links: {
      repository: 'https://github.com/Alcoreza/Pedalya',
    },
    screenshots: [
      {
        src: '/projects/pedalya.webp',
        alt: 'Pedalya landing page: the headline “Book smarter. Ride sooner.” beside a bicycle illustration and booking-status cards.',
        width: 1600,
        height: 768,
      },
    ],
    limitations: ['Not publicly deployed yet.'],
  },
  {
    slug: 'smartfeather',
    title: 'SmartFeather',
    summary: 'An IoT-driven poultry-farm platform for monitoring house conditions, assigning work, and keeping records.',
    teamLabel: 'Capstone · team of 4 · manager & admin frontend',
    problem: 'Poultry farms need one place to monitor houses, flocks, sensors, inventory, and biosecurity, and to coordinate the people doing the work.',
    role: 'Built the manager and admin frontend and UI: dashboards, house, inventory, sensor, and report pages, shared layout, responsive sidebar, login, and pagination.',
    collaboration:
      'Capstone project built by a team of four for a client farm. Built the manager and admin frontend together with one groupmate.',
    status: 'completed',
    featured: false,
    stack: [
      { name: 'Laravel', evidence: 'confirmed' },
      { name: 'Blade', evidence: 'confirmed' },
      { name: 'JavaScript', evidence: 'confirmed' },
      { name: 'CSS', evidence: 'confirmed' },
      { name: 'Firebase', evidence: 'qualified' },
    ],
    features: [
      'Manager and admin dashboards',
      'House, flock, inventory, sensor, and report management pages',
      'Sensor data presented in readable dashboards',
      'Responsive sidebar and navigation',
    ],
    validation: [],
    links: {
      repository: 'https://github.com/Alcoreza/SmartFeather',
      live: 'https://smartfeather.org/',
    },
    screenshots: [
      {
        src: '/projects/smartfeather.webp',
        alt: 'SmartFeather landing page: the headline “SmartFeather for MJBJ Corporation” over a photo of chickens in tall grass.',
        width: 1600,
        height: 768,
      },
    ],
    limitations: ['Sign-in is limited to the client’s staff, so public visitors only see the landing page.'],
  },
]
