import { Badge, type BadgeTone } from './components/Badge/Badge'
import { ButtonLink } from './components/ButtonLink/ButtonLink'
import { Card } from './components/Card/Card'
import { Pending } from './components/Pending/Pending'
import { Section } from './components/Section/Section'
import { SiteFooter } from './components/SiteFooter/SiteFooter'
import { SiteHeader } from './components/SiteHeader/SiteHeader'
import { profile } from './content/profile'
import { projects } from './content/projects'
import type { ProjectStatus } from './content/types'
import styles from './App.module.css'

const statusBadge: Record<ProjectStatus, { label: string; tone: BadgeTone }> = {
  completed: { label: 'Completed', tone: 'done' },
  'in-progress': { label: 'In progress', tone: 'progress' },
  planned: { label: 'Planned', tone: 'pending' },
}

export default function App() {
  return (
    <>
      <SiteHeader name={profile.name} />

      <main id="main" tabIndex={-1} className={styles.main}>
        <section id="top" aria-labelledby="hero-heading" className={styles.hero}>
          <div className={styles.heroInner}>
            <p className={styles.eyebrow}>{profile.targetRoles.join(' · ')}</p>
            <h1 id="hero-heading" className={styles.heroTitle}>
              Hi, I’m {profile.name}.
            </h1>
            <p className={styles.headline}>{profile.headline}</p>
            <p className={styles.supporting}>{profile.supportingLine}</p>
            <div className={styles.actions}>
              <ButtonLink href="#projects">View projects</ButtonLink>
              <ButtonLink href="#contact" variant="secondary">
                Contact
              </ButtonLink>
            </div>
          </div>
        </section>

        <Section id="about" title="About">
          <Pending>The introduction, focus, and way of working are written in Phase 4.</Pending>
        </Section>

        <Section id="projects" title="Projects" intro="Each project states what I built and who I built it with.">
          <ul role="list" className={styles.projectGrid}>
            {projects.map((project) => {
              const status = statusBadge[project.status]
              return (
                <Card as="li" key={project.slug}>
                  <div className={styles.projectHeader}>
                    <h3 className={styles.projectTitle}>{project.title}</h3>
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </div>
                  <p>{project.summary}</p>
                  <ul role="list" className={styles.tags} aria-label={`${project.title} technologies`}>
                    {project.stack.map((tech) => (
                      <li key={tech.name}>
                        <Badge>{tech.name}</Badge>
                      </li>
                    ))}
                  </ul>
                </Card>
              )
            })}
          </ul>
        </Section>

        <Section id="skills" title="Skills">
          <Pending>Skills grouped by practical capability are added in Phase 4.</Pending>
        </Section>

        <Section id="resume" title="Résumé">
          <Pending>The downloadable résumé will appear here once the file is ready.</Pending>
        </Section>

        <Section id="certifications" title="Certifications">
          <Pending>Certifications are listed only after their details are verified.</Pending>
        </Section>

        <Section id="contact" title="Contact">
          <div className={styles.actions}>
            {profile.links.github.href && (
              <ButtonLink href={profile.links.github.href} variant="secondary" external>
                {profile.links.github.label}
              </ButtonLink>
            )}
          </div>
          <Pending>Email and LinkedIn will be added once they are confirmed for publishing.</Pending>
        </Section>
      </main>

      <SiteFooter name={profile.name} />
    </>
  )
}
