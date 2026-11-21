import type { Profile } from './types'

export const profile: Profile = {
  name: 'Clive Owen S. Benito',
  shortName: 'Clive',
  headline:
    'Junior developer who turns requirements into working web applications, from responsive frontends to tested APIs.',
  supportingLine: 'React, TypeScript, Python (FastAPI), and PHP (Laravel, CodeIgniter).',
  targetRoles: ['Junior Full-Stack Developer Intern', 'Junior Front-end Developer Intern'],
  about: [
    'I’m an Information Technology student at FEU Institute of Technology, specializing in Web and Mobile Applications. I build web applications end to end, from responsive interfaces to the APIs and databases behind them.',
    'My strongest work is on the frontend: turning requirements into clear, accessible interfaces. I’m growing into full-stack development. My solo project, CareerTrack, covers the whole path: a Next.js frontend, a FastAPI backend with PostgreSQL, AI résumé analysis with the Gemini API, security hardening, automated tests, and deployment.',
    'I work in small, documented steps: confirm the requirements, build, test, and record what changed. On team projects I own a clear part of the system and coordinate with the people building the rest.',
  ],
  facts: [
    { label: 'Looking for', value: 'Full-stack or front-end developer internship' },
    { label: 'Studying', value: 'BSIT – Web and Mobile Applications' },
    { label: 'Focus', value: 'React, TypeScript, and accessible UI' },
    { label: 'Based in', value: 'Manila, Philippines' },
  ],
  education: {
    school: 'FEU Institute of Technology',
    program: 'BS Information Technology – Web and Mobile Applications',
    years: '2023 – present',
  },
  affiliations: ['Member, Alliance of Information Technology Students (2025 – present)'],
  email: { user: 'clivebenito21', domain: 'gmail.com' },
  links: {
    github: { label: 'GitHub', href: 'https://github.com/Clive-04' },
    linkedin: { label: 'LinkedIn', href: 'https://www.linkedin.com/in/clive04/' },
    // Pending: a public résumé without phone number or home address.
    resume: { label: 'Download résumé (PDF)' },
  },
}
