import type { CSSProperties } from 'react'
import { ButtonLink } from './components/ButtonLink/ButtonLink'
import { CertificationList } from './components/CertificationList/CertificationList'
import { Pending } from './components/Pending/Pending'
import { ProjectCard } from './components/ProjectCard/ProjectCard'
import { Section } from './components/Section/Section'
import { SiteFooter } from './components/SiteFooter/SiteFooter'
import { SiteHeader } from './components/SiteHeader/SiteHeader'
import { SkillsGrid } from './components/SkillsGrid/SkillsGrid'
import { certifications, credlyProfile } from './content/certifications'
import { profile } from './content/profile'
import { projects } from './content/projects'
import { skillGroups } from './content/skills'
import { useReveal } from './lib/useReveal'
import styles from './App.module.css'

const published = certifications.filter((item) => item.published)
const examCertifications = published.filter((item) => item.kind === 'certification')
const courseBadges = published.filter((item) => item.kind === 'course-badge')

// Counts shown in the hero card come from the content files, so they stay accurate.
const liveCount = projects.filter((project) => project.links.live).length
const stats = [
  { value: projects.length, label: projects.length === 1 ? 'Project' : 'Projects' },
  { value: published.length, label: published.length === 1 ? 'Credential' : 'Credentials' },
  { value: liveCount, label: liveCount === 1 ? 'Live app' : 'Live apps' },
]

// Assembled at render time so the full address is never a single string in the page source.
const email = profile.email ? `${profile.email.user}@${profile.email.domain}` : undefined

const { github, linkedin, resume } = profile.links

export default function App() {
  useReveal()

  return (
    <>
      <SiteHeader name={profile.name} />

      <main id="main" tabIndex={-1} className={styles.main}>
        <section id="top" aria-labelledby="hero-heading" className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.heroText}>
              <p className={styles.status}>
                <span className={styles.statusDot} aria-hidden="true" />
                Open to internship opportunities
              </p>
              <h1 id="hero-heading" className={styles.heroTitle}>
                {profile.name}
              </h1>
              <p className={styles.eyebrow}>{profile.targetRoles.join(' · ')}</p>
              <p className={styles.headline}>{profile.headline}</p>
              <div className={styles.actions}>
                <ButtonLink href="#projects">View projects</ButtonLink>
                {resume.href ? (
                  <ButtonLink href={resume.href} variant="secondary" download>
                    {resume.label}
                  </ButtonLink>
                ) : (
                  <ButtonLink href="#contact" variant="secondary">
                    Contact me
                  </ButtonLink>
                )}
              </div>
            </div>

            <aside className={styles.heroCard} aria-label="At a glance">
              <div className={styles.profile}>
                {profile.photo && (
                  <span className={styles.photoFrame}>
                    <img
                      className={styles.photo}
                      src={profile.photo.src}
                      alt={profile.photo.alt}
                      width={profile.photo.width}
                      height={profile.photo.height}
                      fetchPriority="high"
                    />
                  </span>
                )}
                <div>
                  <p className={styles.heroCardLabel}>At a glance</p>
                  <p className={styles.profileName}>{profile.name}</p>
                  <p className={styles.profileSchool}>{profile.education.school}</p>
                </div>
              </div>
              <p className={styles.heroCardProgram}>
                {profile.education.program}
                <span>{profile.education.years}</span>
              </p>
              <dl className={styles.stats}>
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <dt>{stat.label}</dt>
                    <dd>{stat.value}</dd>
                  </div>
                ))}
              </dl>
              <p className={styles.heroCardStack}>{profile.supportingLine}</p>
            </aside>
          </div>
        </section>

        <Section id="about" index="01" title="About">
          <div className={styles.about}>
            <div className={styles.aboutText} data-reveal>
              {profile.about.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
            <dl className={styles.facts} data-reveal style={{ '--reveal-delay': '120ms' } as CSSProperties}>
              {profile.facts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Section>

        <Section
          id="projects"
          index="02"
          tone="band"
          title="Selected projects"
          intro="Each project states what I built, who I built it with, and how it was tested. Open a case study for the details."
        >
          <ul role="list" className={styles.projectGrid}>
            {projects.map((project, index) => (
              <ProjectCard key={project.slug} project={project} index={index} />
            ))}
          </ul>
        </Section>

        <Section
          id="skills"
          index="03"
          title="Skills"
          intro="Grouped by what I can do, with the projects that show it. No self-rated skill bars."
        >
          <SkillsGrid groups={skillGroups} />
        </Section>

        <Section id="resume" index="04" tone="band" title="Résumé">
          <div className={styles.resume}>
            <div className={styles.resumeBlock} data-reveal style={{ '--reveal-delay': '0ms' } as CSSProperties}>
              <h3 className={styles.resumeLabel}>Education</h3>
              <p className={styles.resumeStrong}>{profile.education.school}</p>
              <p>{profile.education.program}</p>
              <p className={styles.muted}>{profile.education.years}</p>
            </div>
            <div className={styles.resumeBlock} data-reveal style={{ '--reveal-delay': '100ms' } as CSSProperties}>
              <h3 className={styles.resumeLabel}>Affiliations</h3>
              {profile.affiliations.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
            <div className={styles.resumeBlock} data-reveal style={{ '--reveal-delay': '200ms' } as CSSProperties}>
              <h3 className={styles.resumeLabel}>Credentials</h3>
              <p>
                {examCertifications.length} certifications and {courseBadges.length} Cisco Networking Academy course
                badges.
              </p>
              <a href="#certifications">See the list</a>
            </div>
          </div>
          {resume.href ? (
            <div className={styles.actions}>
              <ButtonLink href={resume.href} download>
                {resume.label}
              </ButtonLink>
            </div>
          ) : (
            <Pending>A downloadable PDF will be added once a public version without personal contact details is ready.</Pending>
          )}
        </Section>

        <Section
          id="certifications"
          index="05"
          title="Certifications"
          intro="Each entry links to its public verification page, so anyone can confirm it."
        >
          <div className={styles.certHeader}>
            <h3 className={styles.subheading}>Certifications</h3>
            <ButtonLink href={credlyProfile} variant="secondary" size="sm" external>
              View all on Credly
            </ButtonLink>
          </div>
          <CertificationList items={examCertifications} />
          <h3 className={`${styles.subheading} ${styles.spaced}`}>Course badges</h3>
          <p className={styles.note}>
            Verified Cisco Networking Academy badges for completing each course. These are course completions, not
            Cisco exam certifications.
          </p>
          <CertificationList items={courseBadges} layout="grid" />
        </Section>

        <Section
          id="contact"
          index="06"
          tone="ink"
          title="Let’s work together"
          intro="I’m looking for a full-stack or front-end developer internship. Email is the fastest way to reach me."
        >
          <div className={styles.actions}>
            {email && (
              <ButtonLink href={`mailto:${email}`} variant="light">
                Email me
              </ButtonLink>
            )}
            {linkedin.href && (
              <ButtonLink href={linkedin.href} variant="ghost" external>
                {linkedin.label}
              </ButtonLink>
            )}
            {github.href && (
              <ButtonLink href={github.href} variant="ghost" external>
                {github.label}
              </ButtonLink>
            )}
          </div>
          {email && <p className={styles.contactEmail}>{email}</p>}
        </Section>
      </main>

      <SiteFooter name={profile.name} />
    </>
  )
}
