import type { SkillGroup } from './types'

/**
 * Skills grouped by capability. Every group points to the projects that
 * demonstrate it; technologies without project evidence are left out.
 */
export const skillGroups: SkillGroup[] = [
  {
    title: 'Frontend',
    items: ['React', 'Next.js', 'TypeScript', 'JavaScript', 'HTML & CSS', 'Blade templates', 'Tailwind CSS'],
    projects: ['careertrack', 'pedalya', 'smartfeather', 'pasa-buy'],
  },
  {
    title: 'Backend',
    items: ['Python (FastAPI)', 'PHP (Laravel)', 'PHP (CodeIgniter 4)', 'REST APIs', 'JWT authentication'],
    projects: ['careertrack', 'pasa-buy'],
  },
  {
    title: 'Databases',
    items: ['PostgreSQL', 'MySQL', 'SQLAlchemy', 'Alembic migrations'],
    projects: ['careertrack', 'pasa-buy'],
  },
  {
    title: 'Testing and quality',
    items: ['Vitest', 'Playwright', 'k6 load testing', 'Security hardening'],
    projects: ['careertrack', 'pedalya'],
  },
  {
    title: 'UI/UX and responsive design',
    items: ['Responsive layouts', 'Accessible navigation', 'Form validation', 'Dashboard interfaces'],
    projects: ['pedalya', 'smartfeather', 'careertrack'],
  },
  {
    title: 'Tools and AI',
    items: ['Git and GitHub', 'Docker', 'Vercel and Render', 'Gemini API'],
    projects: ['careertrack'],
  },
]
