import type { SkillGroup } from './types'

/**
 * Skills grouped by capability, each mapped to the projects whose
 * repositories show it (checked 2026-11-21/22; Pasa-Buy additions 2026-11-25). Technologies without
 * project evidence are left out. Project slugs match projects.ts.
 */
export const skillGroups: SkillGroup[] = [
  {
    title: 'Frontend',
    blurb: 'Interfaces, layouts, and component code.',
    skills: [
      { name: 'React', projects: ['careertrack'] },
      { name: 'Next.js', projects: ['careertrack'] },
      { name: 'TypeScript', projects: ['careertrack'] },
      { name: 'JavaScript', projects: ['pasa-buy', 'pedalya', 'smartfeather'] },
      { name: 'HTML & CSS', projects: ['careertrack', 'pasa-buy', 'pedalya', 'smartfeather'] },
      { name: 'Blade templates', projects: ['pedalya', 'smartfeather'] },
      { name: 'Tailwind CSS', projects: ['careertrack'] },
    ],
  },
  {
    title: 'Backend',
    blurb: 'APIs, server logic, and authentication.',
    skills: [
      { name: 'Python · FastAPI', projects: ['careertrack'] },
      { name: 'PHP · CodeIgniter 4', projects: ['pasa-buy'] },
      { name: 'PHP · Laravel', projects: ['smartfeather'] },
      { name: 'REST APIs', projects: ['careertrack'] },
      { name: 'Payment integration (test mode)', projects: ['pasa-buy'] },
      { name: 'Real-time chat', projects: ['pasa-buy'] },
      { name: 'JWT authentication', projects: ['careertrack'] },
    ],
  },
  {
    title: 'Databases',
    blurb: 'Schemas, queries, and migrations.',
    skills: [
      { name: 'PostgreSQL', projects: ['careertrack'] },
      { name: 'MySQL', projects: ['pasa-buy'] },
      { name: 'SQLAlchemy', projects: ['careertrack'] },
      { name: 'Alembic migrations', projects: ['careertrack'] },
      { name: 'Transactions & row locking', projects: ['pasa-buy'] },
    ],
  },
  {
    title: 'Testing & quality',
    blurb: 'Automated tests, load tests, and hardening.',
    skills: [
      { name: 'Vitest', projects: ['careertrack'] },
      { name: 'Playwright', projects: ['careertrack'] },
      { name: 'PHPUnit', projects: ['pasa-buy'] },
      { name: 'k6 load testing', projects: ['pedalya'] },
      { name: 'Security hardening', projects: ['careertrack', 'pasa-buy'] },
      { name: 'CI with GitHub Actions', projects: ['pasa-buy'] },
    ],
  },
  {
    title: 'UI/UX & responsive',
    blurb: 'Layouts and flows that work on any screen.',
    skills: [
      { name: 'Responsive layouts', projects: ['careertrack', 'pasa-buy', 'pedalya', 'smartfeather'] },
      { name: 'Responsive navigation', projects: ['pedalya', 'smartfeather'] },
      { name: 'Form validation', projects: ['careertrack', 'pasa-buy', 'pedalya'] },
      { name: 'Dashboard interfaces', projects: ['careertrack', 'pasa-buy', 'pedalya', 'smartfeather'] },
    ],
  },
  {
    title: 'Tools & AI',
    blurb: 'Version control, deployment, and AI APIs.',
    skills: [
      { name: 'Git & GitHub', projects: ['careertrack', 'pasa-buy', 'pedalya', 'smartfeather'] },
      { name: 'Docker', projects: ['careertrack'] },
      { name: 'Vercel & Render', projects: ['careertrack'] },
      { name: 'Gemini API', projects: ['careertrack'] },
      { name: 'AI coding agents (Claude Code, Codex)', projects: ['pasa-buy'] },
    ],
  },
]
