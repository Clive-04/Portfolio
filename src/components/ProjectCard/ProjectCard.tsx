import { useId, useState } from 'react'
import type { Project, ProjectStatus } from '../../content/types'
import { Badge, type BadgeTone } from '../Badge/Badge'
import { ButtonLink } from '../ButtonLink/ButtonLink'
import styles from './ProjectCard.module.css'

const statusBadge: Record<ProjectStatus, { label: string; tone: BadgeTone }> = {
  completed: { label: 'Completed', tone: 'done' },
  'in-progress': { label: 'In progress', tone: 'progress' },
  planned: { label: 'Planned', tone: 'pending' },
}

/** Technologies shown on the collapsed card; the rest appear in the case study. */
const VISIBLE_TAGS = 4

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [open, setOpen] = useState(false)
  const detailsId = useId()
  const status = statusBadge[project.status]
  const visibleTags = project.stack.slice(0, VISIBLE_TAGS)
  const hiddenCount = project.stack.length - visibleTags.length
  const screenshot = project.screenshots[0]
  const forProject = <span className="visually-hidden"> for {project.title}</span>

  return (
    <li id={`project-${project.slug}`} className={styles.card} data-open={open}>
      <div className={styles.cover}>
        {screenshot ? (
          <img
            src={screenshot.src}
            alt={screenshot.alt}
            width={screenshot.width}
            height={screenshot.height}
            loading="lazy"
            decoding="async"
          />
        ) : (
          // No screenshot: a decorative cover built from the project name.
          <div className={styles.placeholder} aria-hidden="true">
            <span>{project.title}</span>
          </div>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.header}>
          <h3 className={styles.title}>{project.title}</h3>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
        <p className={styles.team}>{project.teamLabel}</p>
        <p className={styles.summary}>{project.summary}</p>

        <ul role="list" className={styles.tags} aria-label={`${project.title} main technologies`}>
          {visibleTags.map((tech) => (
            <li key={tech.name}>
              <Badge>{tech.name}</Badge>
            </li>
          ))}
          {hiddenCount > 0 && (
            <li>
              <Badge>+{hiddenCount} more</Badge>
            </li>
          )}
        </ul>

        <div className={styles.actions}>
          {project.links.live && (
            <ButtonLink href={project.links.live} variant="secondary" size="sm" external>
              Live site{forProject}
            </ButtonLink>
          )}
          {project.links.repository && (
            <ButtonLink href={project.links.repository} variant="secondary" size="sm" external>
              Code{forProject}
            </ButtonLink>
          )}
          <button
            type="button"
            className={styles.toggle}
            aria-expanded={open}
            aria-controls={detailsId}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? 'Hide case study' : 'Read case study'}
            {forProject}
            <span className={styles.chevron} aria-hidden="true" />
          </button>
        </div>

        {/* Collapsed details use `visibility: hidden`, so they leave the tab order and the accessibility tree. */}
        <div id={detailsId} className={styles.details} data-open={open}>
          <div className={styles.detailsInner}>
            <dl className={styles.facts}>
              <div>
                <dt>Problem</dt>
                <dd>{project.problem}</dd>
              </div>
              <div>
                <dt>My role</dt>
                <dd>{project.role}</dd>
              </div>
              <div>
                <dt>Collaboration</dt>
                <dd>{project.collaboration}</dd>
              </div>
              <div>
                <dt>Stack</dt>
                <dd>{project.stack.map((tech) => tech.name).join(' · ')}</dd>
              </div>
            </dl>

            <div className={styles.lists}>
              <DetailList title="Features" items={project.features} />
              <DetailList title="Testing evidence" items={project.validation} />
              <DetailList title="Limitations" items={project.limitations} />
            </div>

            {project.links.history && (
              <p className={styles.history}>
                Original commit history:{' '}
                <a href={project.links.history} target="_blank" rel="noopener noreferrer">
                  {project.links.history.replace('https://github.com/', '')}
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </li>
  )
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  // Leave the heading out entirely when there is nothing to show.
  if (items.length === 0) return null
  return (
    <section className={styles.list}>
      <h4 className={styles.listTitle}>{title}</h4>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}
