import type { CSSProperties } from 'react'
import { AboutBento } from './components/AboutBento/AboutBento'
import { ButtonLink } from './components/ButtonLink/ButtonLink'
import { KineticName } from './components/KineticName/KineticName'
import { TechMarquee } from './components/TechMarquee/TechMarquee'
import { CertificationList } from './components/CertificationList/CertificationList'
import { Companion } from './components/Companion/Companion'
import { Pending } from './components/Pending/Pending'
import { PixelIcon } from './components/PixelIcon/PixelIcon'
import type { PixelIconName } from './components/PixelIcon/bitmaps'
import { ProjectCard } from './components/ProjectCard/ProjectCard'
import { Section } from './components/Section/Section'
import { SiteFooter } from './components/SiteFooter/SiteFooter'
import { SiteHeader } from './components/SiteHeader/SiteHeader'
import { SkillsMatrix } from './components/SkillsMatrix/SkillsMatrix'
import { SoundPrompt } from './components/SoundPrompt/SoundPrompt'
import { certifications, credlyProfile } from './content/certifications'
import { profile } from './content/profile'
import { projects } from './content/projects'
import { skillGroups } from './content/skills'
import { useInterfaceSounds } from './lib/useInterfaceSounds'
import { useReveal } from './lib/useReveal'
import { useSpotlight } from './lib/useSpotlight'
import styles from './App.module.css'

const published = certifications.filter((item) => item.published)
const examCertifications = published.filter((item) => item.kind === 'certification')
const courseBadges = published.filter((item) => item.kind === 'course-badge')

// Counts shown in the About tiles come from the content files, so they stay accurate.
const liveCount = projects.filter((project) => project.links.live).length
const stats: { value: number; label: string; icon: PixelIconName }[] = [
  { value: projects.length, label: projects.length === 1 ? 'Project' : 'Projects', icon: 'monitor' },
  { value: published.length, label: published.length === 1 ? 'Credential' : 'Credentials', icon: 'emblem' },
  { value: liveCount, label: liveCount === 1 ? 'Live app' : 'Live apps', icon: 'globe' },
]

// Assembled at render time so the full address is never a single string in the page source.
const email = profile.email ? `${profile.email.user}@${profile.email.domain}` : undefined

const { github, linkedin, resume } = profile.links

// The ticker shows each technology once, in the order the skills list them.
const marqueeItems = [...new Set(skillGroups.flatMap((group) => group.skills.map((skill) => skill.name)))]

export default function App() {
  useReveal()
  useSpotlight()
  useInterfaceSounds()

  return (
    <>
      <SiteHeader name={profile.name} />

      <main id="main" tabIndex={-1} className={styles.main}>
        <SoundPrompt />
        <section id="top" aria-labelledby="hero-heading" className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.heroText}>
              <p className={styles.status}>
                <span className={styles.statusDot} aria-hidden="true" />
                Open to internships
              </p>
              <KineticName id="hero-heading" name={profile.name} className={styles.heroTitle} />
              <p className={styles.eyebrow}>{profile.title}</p>
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

            {/*
              Portrait with decorative orbit rings (Classic). The pixel design swaps
              the rings for a keyline frame and a CSS-only halftone overlay; the
              photo file and its size come from profile.ts, so replacing it later
              only means swapping the file and its width/height.
            */}
            {profile.photo && (
              <div className={styles.portrait}>
                <span className={styles.orbit} aria-hidden="true" />
                <span className={`${styles.orbit} ${styles.orbitOuter}`} aria-hidden="true" />
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
              </div>
            )}

            {/* Pixel design only: the same counts as the About tiles, as a compact strip. */}
            <dl className={styles.heroStats}>
              {stats.map((stat) => (
                <div key={stat.label} className={styles.heroStat}>
                  {/* The icon sits inside <dt>: a <dl> group may only contain <dt> and <dd>. */}
                  <dt>
                    <PixelIcon name={stat.icon} size={32} className={styles.heroStatIcon} />
                    {stat.label}
                  </dt>
                  <dd>{stat.value}</dd>
                </div>
              ))}
            </dl>
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
          intro="What I built, who I built it with, and how it was tested. Open any case study for the full story."
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
          intro="Pick a category to see each skill and the projects that show it."
        >
          <SkillsMatrix groups={skillGroups} />
        </Section>

        <Section id="resume" index="04" title="Résumé">
          <div className={styles.resume}>
            <div className={styles.resumeBlock} data-companion-anchor="resume" data-companion-place="top below" data-companion-act data-reveal data-spotlight style={{ '--reveal-delay': '0ms' } as CSSProperties}>
              <h3 className={styles.resumeLabel}>Education</h3>
              <p className={styles.resumeStrong}>{profile.education.school}</p>
              <p>{profile.education.program}</p>
              <p className={styles.muted}>{profile.education.years}</p>
            </div>
            <div className={styles.resumeBlock} data-companion-anchor="resume" data-companion-place="top below" data-companion-act data-reveal data-spotlight style={{ '--reveal-delay': '100ms' } as CSSProperties}>
              <h3 className={styles.resumeLabel}>Organization</h3>
              {profile.affiliations.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </div>
          {resume.href ? (
            <div className={styles.actions}>
              <ButtonLink href={resume.href} icon="down" download>
                {resume.label}
              </ButtonLink>
            </div>
          ) : (
            <Pending>A downloadable PDF is on its way.</Pending>
          )}
        </Section>

        <Section
          id="certifications"
          index="05"
          tone="band"
          title="Certifications"
          intro="Every entry links to a public page where anyone can verify it."
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
          intro="Email is the fastest way to reach me. You can also find me on LinkedIn and GitHub."
        >
          <div className={styles.actions} data-companion-anchor="contact" data-companion-place="beside below" data-companion-act>
            {email && (
              <ButtonLink href={`mailto:${email}`} variant="light" icon="mail">
                Email me
              </ButtonLink>
            )}
            {linkedin.href && (
              <ButtonLink href={linkedin.href} variant="ghost" leadingIcon="linkedin" external>
                {linkedin.label}
              </ButtonLink>
            )}
            {github.href && (
              <ButtonLink href={github.href} variant="ghost" leadingIcon="github" external>
                {github.label}
              </ButtonLink>
            )}
          </div>
          {email && <p className={styles.contactEmail}>{email}</p>}
        </Section>
      </main>

      <SiteFooter name={profile.name} />
      <Companion />
    </>
  )
}
