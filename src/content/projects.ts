import type { Project } from './types'

/**
 * Every claim here was checked against the project's repository
 * history on 2026-11-21/22. Update only after verified milestones.
 */
export const projects: Project[] = [
  {
    slug: 'careertrack',
    title: 'CareerTrack',
    summary: 'A full-stack workspace for managing a job search, with AI-assisted résumé analysis.',
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
      { name: 'Gemini API', evidence: 'confirmed' },
    ],
    features: [
      'Jobs, applications, interviews, résumés, and skills management',
      'AI résumé analysis and dashboard insights',
      'Cookie-based JWT authentication with CSRF protection and protected routes',
      'Responsive workspace with a public landing page',
    ],
    validation: [
      'Component tests with Vitest and end-to-end tests with Playwright on desktop and mobile',
      'Backend test suite',
      'Dedicated security-hardening phase; live site serves CSP, HSTS, and anti-framing headers',
    ],
    links: {
      repository: 'https://github.com/Clive-04/CareerTrack',
      live: 'https://career-track-bice.vercel.app/',
    },
    screenshots: [],
    limitations: ['Backend runs on a free hosting tier, so the first request after idle can be slow.'],
  },
  {
    slug: 'pasa-buy',
    title: 'Pasa-Buy',
    summary: 'A community request platform where users post errands and others accept them.',
    problem: 'People need a simple way to ask others to buy or deliver items and to coordinate those requests.',
    role: 'Built the frontend and most backend features: profiles, messaging with attachments, notifications, wallet, user search, ratings, and referrals.',
    collaboration:
      'Built with one collaborator, who wrote the core authentication and request backend. The repository was re-created after completion, so the original history is kept in a separate repository.',
    status: 'completed',
    featured: true,
    stack: [
      { name: 'PHP', evidence: 'confirmed' },
      { name: 'CodeIgniter 4', evidence: 'confirmed' },
      { name: 'MySQL', evidence: 'confirmed' },
      { name: 'JavaScript', evidence: 'confirmed' },
      { name: 'CSS', evidence: 'confirmed' },
    ],
    features: [
      'Post, browse, filter, and accept requests',
      'User profiles with photo upload and public profile pages',
      'Direct messaging with attachments and notifications',
      'Wallet, ratings, and referrals',
    ],
    validation: [],
    links: {
      repository: 'https://github.com/Clive-04/Pasa-Buy',
      history: 'https://github.com/Clive-04/Pasa-Buy-Project',
    },
    screenshots: [],
    limitations: ['Not deployed publicly.', 'No automated tests.'],
  },
  {
    slug: 'pedalya',
    title: 'Pedalya',
    summary: 'A bicycle repair booking system with customer booking, payment, and repair tracking.',
    problem: 'Repair-shop customers need to book services, pay, and follow repair progress without calling the shop.',
    role: 'Designed and built the customer-facing frontend: booking flow, bookings, repair tracking, payment preview, dashboard, profile, and responsive navigation. Wrote a k6 load test.',
    collaboration: 'Team project. Teammates integrated the frontend with the Laravel backend and payment provider, and wrote the automated tests.',
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
    screenshots: [],
    limitations: ['Not deployed publicly.'],
  },
  {
    slug: 'smartfeather',
    title: 'SmartFeather',
    summary: 'A poultry-house monitoring system for managers and administrators.',
    problem: 'Poultry farms need one place to monitor houses, flocks, sensors, inventory, and biosecurity.',
    role: 'Built the manager and admin frontend: dashboards, house, inventory, sensor, and report pages, shared layout, responsive sidebar, login, and pagination.',
    collaboration: 'Team project. Built the manager and admin frontend together with one groupmate.',
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
      'Responsive sidebar and navigation',
    ],
    validation: [],
    links: {
      repository: 'https://github.com/Alcoreza/SmartFeather',
    },
    screenshots: [],
    limitations: ['Not deployed publicly.'],
  },
]
