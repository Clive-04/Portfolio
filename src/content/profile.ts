import type { Profile } from './types'

export const profile: Profile = {
  name: 'Clive Owen S. Benito',
  shortName: 'Clive',
  photo: { src: '/profile.jpg', alt: 'Clive Owen S. Benito in a formal suit and tie', width: 299, height: 299 },
  /** Shown above the headline. The internship ask lives in the status pill and the About tile. */
  title: 'Full-stack & front-end developer',
  headline: 'I turn requirements into working web applications, from responsive frontends to tested APIs.',
  about: [
    'I’m an IT student at FEU – Institute of Technology who builds web applications end to end: interfaces first, then the APIs and databases behind them.',
    'My strongest work is on the frontend, and I’m growing into full-stack development. My solo project, CareerTrack, covers the whole path, from interface to API, AI features, tests, and deployment.',
    'I work in small, documented steps: confirm the requirements, build, test, and record what changed. On team projects I own a clear part of the system and coordinate with the people building the rest.',
  ],
  lookingFor: 'A full-stack or front-end developer internship',
  focus: ['React', 'TypeScript', 'FastAPI', 'Accessible UI'],
  education: {
    school: 'FEU – Institute of Technology',
    program: 'BS Information Technology – Web and Mobile Applications',
    years: '2023 – present',
  },
  affiliations: ['Member, Alliance of Information Technology Students (2025 – present)'],
  email: { user: 'clivebenito21', domain: 'gmail.com' },
  links: {
    github: { label: 'GitHub', href: 'https://github.com/Clive-04' },
    linkedin: { label: 'LinkedIn', href: 'https://www.linkedin.com/in/clive04/' },
    // Published as-is at the user's request (2026-11-22), including phone, address, and school email.
    resume: { label: 'Download résumé (PDF)', href: '/Clive-Owen-Benito-Resume.pdf' },
  },
}
