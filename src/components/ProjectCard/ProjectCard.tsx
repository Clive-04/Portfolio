import { useId, useRef, type CSSProperties } from 'react'
import type { Project, ProjectStatus } from '../../content/types'
import { Badge, type BadgeTone } from '../Badge/Badge'
import buttonStyles from '../ButtonLink/ButtonLink.module.css'
import { ButtonLink } from '../ButtonLink/ButtonLink'
import { Icon } from '../Icon/Icon'
import styles from './ProjectCard.module.css'
import dialogStyles from './CaseStudy.module.css'

const statusBadge: Record<ProjectStatus, { label: string; tone: BadgeTone }> = {
  completed: { label: 'Completed', tone: 'done' },
  'in-progress': { label: 'In progress', tone: 'progress' },
  planned: { label: 'Planned', tone: 'pending' },
}

/** Technologies shown on the card; the case study lists them all. */
const VISIBLE_TAGS = 4

/** View Transitions run only where supported and when the visitor allows motion. */
function canMorph() {
  return (
    'startViewTransition' in document && window.matchMedia('(prefers-reduced-motion: no-preference)').matches
  )
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

interface ProjectCardProps {
  project: Project
  /** Position in the grid, used to stagger the scroll reveal. */
  index?: number
}

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const titleId = useId()
  const cardRef = useRef<HTMLLIElement>(null)
  const cardCoverRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const panelCoverRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const status = statusBadge[project.status]
  const visibleTags = project.stack.slice(0, VISIBLE_TAGS)
  const hiddenCount = project.stack.length - visibleTags.length
  const screenshot = project.screenshots[0]
  const forProject = <span className="visually-hidden"> for {project.title}</span>

  // Shared names pair the card with the open panel, so the browser can morph one into the other.
  const panelName = `case-${project.slug}`
  const coverName = `case-cover-${project.slug}`

  function name(element: HTMLElement | null, value: string) {
    if (element) element.style.viewTransitionName = value
  }

  function openCaseStudy() {
    const dialog = dialogRef.current
    if (!dialog || dialog.open) return

    if (!canMorph()) {
      if (!prefersReducedMotion()) dialog.dataset.anim = 'in'
      dialog.showModal()
      dialog.scrollTop = 0
      return
    }

    name(cardRef.current, panelName)
    name(cardCoverRef.current, coverName)
    const transition = document.startViewTransition(() => {
      name(cardRef.current, '')
      name(cardCoverRef.current, '')
      name(dialogRef.current, panelName)
      name(panelCoverRef.current, coverName)
      dialog.showModal()
      dialog.scrollTop = 0
    })
    transition.finished.finally(() => {
      name(dialogRef.current, '')
      name(panelCoverRef.current, '')
    })
  }

  function closeCaseStudy() {
    const dialog = dialogRef.current
    if (!dialog?.open) return

    if (!canMorph()) {
      if (prefersReducedMotion()) {
        dialog.close()
        return
      }
      dialog.dataset.anim = 'out'
      dialog.addEventListener(
        'animationend',
        () => {
          delete dialog.dataset.anim
          dialog.close()
        },
        { once: true },
      )
      return
    }

    // The dialog box (not its scrolling content) is what morphs back into the card.
    // The screenshot only morphs too if it is still in view.
    const coverInView = dialog.scrollTop < (panelCoverRef.current?.offsetHeight ?? 0) / 2
    name(dialogRef.current, panelName)
    if (coverInView) name(panelCoverRef.current, coverName)
    const transition = document.startViewTransition(() => {
      name(dialogRef.current, '')
      name(panelCoverRef.current, '')
      dialog.close()
      name(cardRef.current, panelName)
      if (coverInView) name(cardCoverRef.current, coverName)
    })
    transition.finished.finally(() => {
      name(cardRef.current, '')
      name(cardCoverRef.current, '')
      triggerRef.current?.focus()
    })
  }

  const cover = screenshot ? (
    <img src={screenshot.src} alt={screenshot.alt} width={screenshot.width} height={screenshot.height} />
  ) : (
    // No screenshot: a decorative cover built from the project name.
    <div className={styles.placeholder} aria-hidden="true">
      <span>{project.title}</span>
    </div>
  )

  return (
    <li
      ref={cardRef}
      id={`project-${project.slug}`}
      className={styles.card}
      data-reveal
      data-spotlight
      style={{ '--reveal-delay': `${(index % 2) * 100}ms` } as CSSProperties}
    >
      {/* The cover is an extra mouse target; keyboard users use the button below. */}
      <div ref={cardCoverRef} className={styles.cover} onClick={openCaseStudy}>
        <span className={styles.coverBadge}>
          <Badge tone={status.tone}>{status.label}</Badge>
        </span>
        {screenshot ? (
          <img
            src={screenshot.src}
            alt=""
            width={screenshot.width}
            height={screenshot.height}
            loading="lazy"
            decoding="async"
          />
        ) : (
          cover
        )}
        <span className={styles.coverHint} aria-hidden="true">
          <Icon name="expand" />
          View case study
        </span>
      </div>

      <div className={styles.body}>
        <p className={styles.team}>{project.teamLabel}</p>
        <h3 className={styles.title}>{project.title}</h3>
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
          <button
            ref={triggerRef}
            type="button"
            className={`${buttonStyles.button} ${buttonStyles.primary} ${buttonStyles.sm}`}
            data-icon="arrow"
            aria-haspopup="dialog"
            onClick={openCaseStudy}
          >
            <span className={buttonStyles.label}>
              View case study{forProject}
            </span>
            <Icon name="arrow" className={buttonStyles.icon} />
          </button>
          {project.links.live && (
            <ButtonLink href={project.links.live} variant="secondary" size="sm" external>
              Live{forProject}
            </ButtonLink>
          )}
          {project.links.repository && (
            <ButtonLink href={project.links.repository} variant="secondary" size="sm" external>
              Code{forProject}
            </ButtonLink>
          )}
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className={dialogStyles.dialog}
        aria-labelledby={titleId}
        onCancel={(event) => {
          // Escape: run the closing animation instead of closing instantly.
          event.preventDefault()
          closeCaseStudy()
        }}
        onClick={(event) => {
          // A click on the dialog element itself is a click on the backdrop.
          if (event.target === event.currentTarget) closeCaseStudy()
        }}
        onAnimationEnd={(event) => {
          if (event.currentTarget.dataset.anim === 'in') delete event.currentTarget.dataset.anim
        }}
      >
        <button type="button" className={dialogStyles.close} onClick={closeCaseStudy}>
          <Icon name="close" />
          <span className="visually-hidden">Close case study</span>
        </button>

        <div className={dialogStyles.panel}>
          {/* Left on wide screens: stays in place while the details scroll. */}
          <div className={dialogStyles.aside}>
            <div ref={panelCoverRef} className={dialogStyles.cover}>
              {cover}
            </div>
            <div className={dialogStyles.intro}>
              <div>
                <p className={dialogStyles.team}>{project.teamLabel}</p>
                <h3 id={titleId} className={dialogStyles.title}>
                  {project.title}
                </h3>
              </div>
              <Badge tone={status.tone}>{status.label}</Badge>
            </div>
            <p className={dialogStyles.summary}>{project.summary}</p>

            <div className={dialogStyles.links}>
              {project.links.live && (
                <ButtonLink href={project.links.live} size="sm" external>
                  Visit live site
                </ButtonLink>
              )}
              {project.links.repository && (
                <ButtonLink href={project.links.repository} variant="secondary" size="sm" external>
                  View code
                </ButtonLink>
              )}
              {project.links.history && (
                <ButtonLink href={project.links.history} variant="secondary" size="sm" external>
                  Original history
                </ButtonLink>
              )}
            </div>

            <div className={dialogStyles.stackBlock}>
              <p className={dialogStyles.label}>Stack</p>
              <ul role="list" className={dialogStyles.stack}>
                {project.stack.map((tech) => (
                  <li key={tech.name}>
                    <Badge>{tech.name}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={dialogStyles.main}>
            <dl className={dialogStyles.facts}>
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
            </dl>

            <div className={dialogStyles.lists}>
              <DetailList title="Features" items={project.features} />
              <DetailList title="Testing evidence" items={project.validation} />
              <DetailList title="Limitations" items={project.limitations} />
            </div>
          </div>
        </div>
      </dialog>
    </li>
  )
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  // Leave the heading out entirely when there is nothing to show.
  if (items.length === 0) return null
  return (
    <section className={dialogStyles.list}>
      <h4 className={dialogStyles.listTitle}>{title}</h4>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}
