import type { CSSProperties } from 'react'
import { AboutBento } from './components/AboutBento/AboutBento'
import { ButtonLink } from './components/ButtonLink/ButtonLink'
import { KineticName } from './components/KineticName/KineticName'
import { TechMarquee } from './components/TechMarquee/TechMarquee'
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
import { useSpotlight } from './lib/useSpotlight'
import styles from './App.module.css'

const published = certifications.filter((item) => item.published)
const examCertifications = published.filter((item) => item.kind === 'certification')
const courseBadges = published.filter((item) => item.kind === 'course-badge')

// Counts shown in the About tiles come from the content files, so they stay accurate.
const liveCount = projects.filter((project) => project.links.live).length
const stats = [
  { value: projects.length, label: projects.length === 1 ? 'Project' : 'Projects' },
  { value: published.length, label: published.length === 1 ? 'Credential' : 'Credentials' },
  { value: liveCount, label: liveCount === 1 ? 'Live app' : 'Live apps' },
]

// Assembled at render time so the full address is never a single string in the page source.
const email = profile.email ? `${profile.email.user}@${profile.email.domain}` : undefined

const { github, linkedin, resume } = profile.links

// The ticker shows each technology once, in the order the skills list them.
const marqueeItems = [...new Set(skillGroups.flatMap((group) => group.items))]

export default function App() {
  useReveal()
  useSpotlight()

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
              <KineticName id="hero-heading" name={profile.name} className={styles.heroTitle} />
              <p className={styles.eyebrow}>{profile.targetRoles.join(' · ')}</p>
              <p className={styles.headline}>{profile.headline}</p>
              <div className={styles.actions}>
                <ButtonLink href="#projects" icon="down">View projects</ButtonLink>
                {resume.href ? (
                  <ButtonLink href={resume.href} variant="secondary" icon="down" download>
                    {resume.label}
                  </ButtonLink>
                ) : (
                  <ButtonLink href="#contact" variant="secondary" icon="arrow">
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
              <p className={styles.heroCardStack}>{profile.supportingLine}</p>
            </aside>
          </div>
        </section>

        <TechMarquee items={marqueeItems} />

        <Section id="about" index="01" title="About">
          <AboutBento profile={profile} stats={stats} />
        </Section>

        <Section
          id="projects"
          index="02"
          tone="band"
          title="Selected projects"
          intro="Each project states what I built, who I built it with, and how it was tested. Open a case study for the details."
        >
          <ul role="list" className={styles.projectGrid}>
            {projects.map((project, index) => {
              const neighbour = (i: number) =>
                projects[i] ? { slug: projects[i].slug, title: projects[i].title } : undefined
              return (
                <ProjectCard
                  key={project.slug}
                  project={project}
                  index={index}
                  total={projects.length}
                  previous={neighbour(index - 1)}
                  next={neighbour(index + 1)}
                />
              )
            })}
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

        <Section id="resume" index="04" title="Résumé">
          <div className={styles.resume}>
            <div className={styles.resumeBlock} data-reveal data-spotlight style={{ '--reveal-delay': '0ms' } as CSSProperties}>
              <h3 className={styles.resumeLabel}>Education</h3>
              <p className={styles.resumeStrong}>{profile.education.school}</p>
              <p>{profile.education.program}</p>
              <p className={styles.muted}>{profile.education.years}</p>
            </div>
            <div className={styles.resumeBlock} data-reveal data-spotlight style={{ '--reveal-delay': '100ms' } as CSSProperties}>
              <h3 className={styles.resumeLabel}>Affiliations</h3>
              {profile.affiliations.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
            <div className={styles.resumeBlock} data-reveal data-spotlight style={{ '--reveal-delay': '200ms' } as CSSProperties}>
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
              <ButtonLink href={resume.href} icon="down" download>
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
          tone="band"
          title="Certifications"
          intro="Each entry links to its public verification page, so anyone can confirm it."
        >
          {/* Summary strip: the counts at a glance, plus the full Credly profile. */}
          <div className={styles.certSummary} data-reveal>
            <dl className={styles.certStats}>
              <div>
                <dt>Certifications</dt>
                <dd>{examCertifications.length}</dd>
              </div>
              <div>
                <dt>Course badges</dt>
                <dd>{courseBadges.length}</dd>
              </div>
              <div>
                <dt>Verifiable online</dt>
                <dd>{published.filter((item) => item.verificationUrl).length}</dd>
              </div>
            </dl>
            <ButtonLink href={credlyProfile} variant="secondary" size="sm" external>
              View all on Credly
            </ButtonLink>
          </div>

          <h3 className={`${styles.subheading} ${styles.spaced}`}>Exam-based certifications</h3>
          <CertificationList items={examCertifications} />

          <div className={`${styles.certGroupHead} ${styles.spaced}`}>
            <h3 className={styles.subheading}>Cisco Networking Academy course badges</h3>
            <p className={styles.note}>
              Verified badges for completing each course. These are course completions, not Cisco exam certifications.
            </p>
          </div>
          <CertificationList items={courseBadges} variant="compact" />
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
              <ButtonLink href={`mailto:${email}`} variant="light" icon="mail">
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
