import { useEffect, useId, useRef, type CSSProperties } from 'react'
import type { Project, ProjectStatus } from '../../content/types'
import { Badge, type BadgeTone } from '../Badge/Badge'
import buttonStyles from '../ButtonLink/ButtonLink.module.css'
import { ButtonLink } from '../ButtonLink/ButtonLink'
import { Icon, type IconName } from '../Icon/Icon'
import styles from './ProjectCard.module.css'
import dialogStyles from './CaseStudy.module.css'

const statusBadge: Record<ProjectStatus, { label: string; tone: BadgeTone }> = {
  completed: { label: 'Completed', tone: 'done' },
  'in-progress': { label: 'In progress', tone: 'progress' },
  planned: { label: 'Planned', tone: 'pending' },
}

/** Technologies shown on the card; the case study lists them all. */
const VISIBLE_TAGS = 4

/** Window event used to open another card's case study (Previous / Next). */
const OPEN_EVENT = 'case-study:open'

/** View Transitions run only where supported and when the visitor allows motion. */
function canMorph() {
  return (
    'startViewTransition' in document && window.matchMedia('(prefers-reduced-motion: no-preference)').matches
  )
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function setName(element: HTMLElement | null, value: string) {
  if (element) element.style.viewTransitionName = value
}

/** True when an element is at least partly inside a container's visible box. */
function isVisibleIn(element: HTMLElement | null, container: HTMLElement) {
  if (!element) return false
  const rect = element.getBoundingClientRect()
  const box = container.getBoundingClientRect()
  return rect.bottom > box.top && rect.top < box.bottom
}

function isOnScreen(element: HTMLElement | null) {
  if (!element) return false
  const rect = element.getBoundingClientRect()
  return rect.bottom > 0 && rect.top < window.innerHeight
}

/** "https://github.com/Clive-04/CareerTrack" → "github.com/Clive-04/CareerTrack" */
function displayUrl(url: string) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

interface Neighbour {
  slug: string
  title: string
}

interface ProjectCardProps {
  project: Project
  /** Position in the grid: staggers the reveal and numbers the case study. */
  index?: number
  total?: number
  previous?: Neighbour
  next?: Neighbour
}

export function ProjectCard({ project, index = 0, total = 1, previous, next }: ProjectCardProps) {
  const titleId = useId()
  const cardRef = useRef<HTMLLIElement>(null)
  const cardCoverRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const panelCoverRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const asideRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)

  /** Every open starts at the top of both columns (and of the sheet on phones). */
  function resetScroll(dialog: HTMLDialogElement) {
    dialog.scrollTop = 0
    asideRef.current?.scrollTo(0, 0)
    mainRef.current?.scrollTo(0, 0)
  }

  const status = statusBadge[project.status]
  const visibleTags = project.stack.slice(0, VISIBLE_TAGS)
  const hiddenCount = project.stack.length - visibleTags.length
  const screenshot = project.screenshots[0]
  const frameUrl = project.links.live ?? project.links.repository
  const forProject = <span className="visually-hidden"> for {project.title}</span>
  const number = (value: number) => String(value).padStart(2, '0')

  // Shared names pair the card with the open dialog, so the browser can morph one into the other.
  const panelName = `case-${project.slug}`
  const coverName = `case-cover-${project.slug}`

  // Previous / Next in another case study asks this card to open its dialog.
  useEffect(() => {
    function onOpen(event: Event) {
      const dialog = dialogRef.current
      if ((event as CustomEvent<string>).detail !== project.slug || !dialog || dialog.open) return
      if (document.documentElement.dataset.caseDirection) setName(dialog, 'case-switch')
      dialog.showModal()
      resetScroll(dialog)
    }
    window.addEventListener(OPEN_EVENT, onOpen)
    return () => window.removeEventListener(OPEN_EVENT, onOpen)
  }, [project.slug])

  function openCaseStudy() {
    const dialog = dialogRef.current
    if (!dialog || dialog.open) return

    if (!canMorph()) {
      if (!prefersReducedMotion()) dialog.dataset.anim = 'in'
      dialog.showModal()
      resetScroll(dialog)
      return
    }

    setName(cardRef.current, panelName)
    setName(cardCoverRef.current, coverName)
    const transition = document.startViewTransition(() => {
      setName(cardRef.current, '')
      setName(cardCoverRef.current, '')
      setName(dialog, panelName)
      setName(panelCoverRef.current, coverName)
      dialog.showModal()
      resetScroll(dialog)
    })
    transition.finished.finally(() => {
      setName(dialog, '')
      setName(panelCoverRef.current, '')
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

    // Morph back into the card only if the card is on screen (after Previous / Next it may not be).
    const cardVisible = isOnScreen(cardRef.current)
    const coverInView = cardVisible && isVisibleIn(panelCoverRef.current, dialog)
    if (cardVisible) setName(dialog, panelName)
    if (coverInView) setName(panelCoverRef.current, coverName)
    const transition = document.startViewTransition(() => {
      setName(dialog, '')
      setName(panelCoverRef.current, '')
      dialog.close()
      if (cardVisible) setName(cardRef.current, panelName)
      if (coverInView) setName(cardCoverRef.current, coverName)
    })
    transition.finished.finally(() => {
      setName(cardRef.current, '')
      setName(cardCoverRef.current, '')
    })
  }

  // The native dialog returns focus to the element that opened it; after
  // Previous / Next that would be the wrong card, so return it to this card.
  function onDialogClose() {
    triggerRef.current?.focus()
  }

  function switchTo(target: Neighbour, direction: 'previous' | 'next') {
    const dialog = dialogRef.current
    if (!dialog?.open) return
    const go = () => {
      dialog.close()
      window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: target.slug }))
    }
    if (!canMorph()) {
      go()
      return
    }
    const root = document.documentElement
    root.dataset.caseDirection = direction
    setName(dialog, 'case-switch')
    const transition = document.startViewTransition(() => {
      setName(dialog, '')
      go()
    })
    transition.finished.finally(() => {
      delete root.dataset.caseDirection
      document.querySelectorAll('dialog').forEach((element) => setName(element, ''))
    })
  }

  // Lazy: closed dialogs would otherwise download every screenshot on page load.
  // The card cover uses the same file, so by the time a visitor opens the
  // dialog the image is usually already cached.
  const cover = screenshot ? (
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
            <ButtonLink href={project.links.repository} variant="secondary" size="sm" leadingIcon="github" external>
              Code{forProject}
            </ButtonLink>
          )}
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className={dialogStyles.dialog}
        aria-labelledby={titleId}
        onClose={onDialogClose}
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
          if (event.target === event.currentTarget && event.currentTarget.dataset.anim === 'in') {
            delete event.currentTarget.dataset.anim
          }
        }}
      >
        {/* Sticky top bar: where you are, and how to leave. */}
        <div className={dialogStyles.topbar}>
          <p className={dialogStyles.counter}>
            Case study <strong>{number(index + 1)}</strong>
            <span aria-hidden="true"> / </span>
            <span className="visually-hidden"> of </span>
            {number(total)}
          </p>
          <div className={dialogStyles.topActions}>
            <kbd className={dialogStyles.kbd} aria-hidden="true">
              Esc
            </kbd>
            <button type="button" className={dialogStyles.close} onClick={closeCaseStudy}>
              <Icon name="close" />
              <span className="visually-hidden">Close case study</span>
            </button>
          </div>
        </div>

        <div className={dialogStyles.panel}>
          {/* Left on wide screens: stays in place while the story scrolls. */}
          <div ref={asideRef} className={dialogStyles.aside}>
            <figure className={dialogStyles.browser}>
              <div className={dialogStyles.chrome} aria-hidden="true">
                <span className={dialogStyles.dots}>
                  <i />
                  <i />
                  <i />
                </span>
                {frameUrl && (
                  <span className={dialogStyles.url}>
                    <Icon name="lock" />
                    {displayUrl(frameUrl)}
                  </span>
                )}
              </div>
              <div ref={panelCoverRef} className={dialogStyles.cover}>
                {cover}
              </div>
            </figure>

            <div className={dialogStyles.intro}>
              <p className={dialogStyles.team}>{project.teamLabel}</p>
              <h3 id={titleId} className={dialogStyles.title}>
                {project.title}
              </h3>
              <p className={dialogStyles.summary}>{project.summary}</p>
            </div>

            <div className={dialogStyles.links}>
              {project.links.live && (
                <ButtonLink href={project.links.live} size="sm" external>
                  Visit live site
                </ButtonLink>
              )}
              {project.links.repository && (
                <ButtonLink
                  href={project.links.repository}
                  variant="secondary"
                  size="sm"
                  leadingIcon="github"
                  external
                >
                  View code
                </ButtonLink>
              )}
              {project.links.history && (
                <ButtonLink
                  href={project.links.history}
                  variant="secondary"
                  size="sm"
                  leadingIcon="github"
                  external
                >
                  Original history
                </ButtonLink>
              )}
            </div>

          </div>

          <div ref={mainRef} className={dialogStyles.main}>
            <dl className={dialogStyles.meta}>
              <div>
                <dt>Status</dt>
                <dd>
                  <Badge tone={status.tone}>{status.label}</Badge>
                </dd>
              </div>
              <div>
                <dt>Stack</dt>
                <dd>
                  <ul role="list" className={dialogStyles.stack}>
                    {project.stack.map((tech) => (
                      <li key={tech.name}>
                        <Badge>{tech.name}</Badge>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>

            <h4 className={dialogStyles.sectionLabel}>The story</h4>
            <ol className={dialogStyles.timeline}>
              <li>
                <span className={dialogStyles.step} aria-hidden="true">
                  01
                </span>
                <h5>Problem</h5>
                <p>{project.problem}</p>
              </li>
              <li>
                <span className={dialogStyles.step} aria-hidden="true">
                  02
                </span>
                <h5>My role</h5>
                <p>{project.role}</p>
              </li>
              <li>
                <span className={dialogStyles.step} aria-hidden="true">
                  03
                </span>
                <h5>Collaboration</h5>
                <p>{project.collaboration}</p>
              </li>
            </ol>

            <DetailList title="Features" icon="check" tone="accent" items={project.features} />
            <DetailList title="Testing evidence" icon="shield" tone="done" items={project.validation} />
            <DetailList title="Limitations" icon="info" tone="muted" items={project.limitations} />

            {(previous || next) && (
              <nav className={dialogStyles.pager} aria-label="Other case studies">
                {previous ? (
                  <button
                    type="button"
                    className={dialogStyles.pagerButton}
                    data-direction="previous"
                    data-sound="navigate"
                    onClick={() => switchTo(previous, 'previous')}
                  >
                    <Icon name="prev" />
                    <span>
                      <small>Previous</small>
                      {previous.title}
                    </span>
                  </button>
                ) : (
                  <span />
                )}
                {next && (
                  <button
                    type="button"
                    className={dialogStyles.pagerButton}
                    data-direction="next"
                    data-sound="navigate"
                    onClick={() => switchTo(next, 'next')}
                  >
                    <span>
                      <small>Next</small>
                      {next.title}
                    </span>
                    <Icon name="next" />
                  </button>
                )}
              </nav>
            )}
          </div>
        </div>
      </dialog>
    </li>
  )
}

interface DetailListProps {
  title: string
  icon: IconName
  tone: 'accent' | 'done' | 'muted'
  items: string[]
}

function DetailList({ title, icon, tone, items }: DetailListProps) {
  // Leave the section out entirely when there is nothing to show.
  if (items.length === 0) return null
  return (
    <section className={dialogStyles.list} data-tone={tone}>
      <h4 className={dialogStyles.sectionLabel}>{title}</h4>
      <ul role="list">
        {items.map((item) => (
          <li key={item}>
            <span className={dialogStyles.listIcon} aria-hidden="true">
              <Icon name={icon} />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}
