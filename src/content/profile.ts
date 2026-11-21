import type { Profile } from './types'

export const profile: Profile = {
  name: 'Clive',
  headline:
    'Junior developer who turns requirements into working web applications, from responsive frontends to tested APIs.',
  supportingLine: 'React, TypeScript, Python (FastAPI), and PHP (Laravel, CodeIgniter).',
  targetRoles: ['Junior Full-Stack Developer Intern', 'Junior Front-end Developer Intern'],
  links: {
    github: { label: 'GitHub', href: 'https://github.com/Clive-04' },
    // Pending: add once the owner confirms what to publish.
    linkedin: { label: 'LinkedIn' },
    email: { label: 'Email' },
    resume: { label: 'Résumé (PDF)' },
  },
}
