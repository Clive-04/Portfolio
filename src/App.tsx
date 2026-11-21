import { ButtonLink } from './components/ButtonLink/ButtonLink'
import { CertificationList } from './components/CertificationList/CertificationList'
import { Pending } from './components/Pending/Pending'
import { ProjectCard } from './components/ProjectCard/ProjectCard'
import { Section } from './components/Section/Section'
import { SiteFooter } from './components/SiteFooter/SiteFooter'
import { SiteHeader } from './components/SiteHeader/SiteHeader'
import { SkillsGrid } from './components/SkillsGrid/SkillsGrid'
import { certifications } from './content/certifications'
import { profile } from './content/profile'
import { projects } from './content/projects'
import { skillGroups } from './content/skills'
import styles from './App.module.css'

const published = certifications.filter((item) => item.published)
const examCertifications = published.filter((item) => item.kind === 'certification')
const courseBadges = published.filter((item) => item.kind === 'course-badge')

// Assembled at render time so the full address is never a single string in the page source.
const email = profile.email ? `${profile.email.user}@${profile.email.domain}` : undefined

const { github, linkedin, resume } = profile.links

export default function App() {
  return (
    <>
      <SiteHeader name={profile.name} />

      <main id="main" tabIndex={-1} className={styles.main}>
        <section id="top" aria-labelledby="hero-heading" className={styles.hero}>
          <div className={styles.heroInner}>
            <p className={styles.eyebrow}>{profile.targetRoles.join(' · ')}</p>
            <h1 id="hero-heading" className={styles.heroTitle}>
              {profile.name}
            </h1>
            <p className={styles.headline}>{profile.headline}</p>
            <p className={styles.supporting}>{profile.supportingLine}</p>
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
        </section>

        <Section id="about" title="About">
          <div className={styles.about}>
            <div className={styles.aboutText}>
              {profile.about.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
            <dl className={styles.facts}>
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
          title="Projects"
          intro="Each project states what I built, who I built it with, and how it was tested. Open a case study for the details."
        >
          <ul role="list" className={styles.projectGrid}>
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </ul>
        </Section>

        <Section
          id="skills"
          title="Skills"
          intro="Grouped by what I can do, with the projects that show it. No self-rated skill bars."
        >
          <SkillsGrid groups={skillGroups} />
        </Section>

        <Section id="resume" title="Résumé">
          <div className={styles.resume}>
            <div>
              <h3 className={styles.subheading}>Education</h3>
              <p className={styles.resumeStrong}>{profile.education.school}</p>
              <p>{profile.education.program}</p>
              <p className={styles.muted}>{profile.education.years}</p>
            </div>
            <div>
              <h3 className={styles.subheading}>Affiliations</h3>
              {profile.affiliations.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
            <div>
              <h3 className={styles.subheading}>Credentials</h3>
              <p>
                {examCertifications.length} certifications and {courseBadges.length} Cisco Networking Academy course
                badges. <a href="#certifications">See the list</a>.
              </p>
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

        <Section id="certifications" title="Certifications">
          <h3 className={styles.subheading}>Certifications</h3>
          <CertificationList items={examCertifications} />
          <h3 className={`${styles.subheading} ${styles.spaced}`}>Course badges</h3>
          <p className={styles.note}>
            Verified Cisco Networking Academy badges for completing each course. These are course completions, not
            Cisco exam certifications.
          </p>
          <CertificationList items={courseBadges} />
        </Section>

        <Section id="contact" title="Contact" intro="Open to internship opportunities. Email is the fastest way to reach me.">
          <div className={styles.actions}>
            {email && <ButtonLink href={`mailto:${email}`}>Email me</ButtonLink>}
            {linkedin.href && (
              <ButtonLink href={linkedin.href} variant="secondary" external>
                {linkedin.label}
              </ButtonLink>
            )}
            {github.href && (
              <ButtonLink href={github.href} variant="secondary" external>
                {github.label}
              </ButtonLink>
            )}
          </div>
          {email && <p className={styles.muted}>{email}</p>}
        </Section>
      </main>

      <SiteFooter name={profile.name} />
    </>
  )
}
