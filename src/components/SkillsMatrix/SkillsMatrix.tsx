import { useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { projects } from '../../content/projects'
import type { SkillGroup } from '../../content/types'
import styles from './SkillsMatrix.module.css'

/** Column order follows the Projects section. Short codes label the columns on small screens. */
const columns = projects.map((project) => ({
  slug: project.slug,
  title: project.title,
  // "CareerTrack" → CT, "Pasa-Buy" → PB, "SmartFeather" → SF, "Pedalya" → PE.
  code: project.title
    .split(/(?=[A-Z])|[\s-]+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
    .padEnd(2, project.title[1]?.toUpperCase() ?? ''),
}))

interface SkillsMatrixProps {
  groups: SkillGroup[]
}

/**
 * Skills as category tabs plus a matrix: each row is a skill, each column a
 * project, and a dot marks where the skill was used. Tabs follow the ARIA
 * tabs pattern (arrow keys, Home, End); the matrix is a real table so screen
 * readers announce "Used" or "Not used" per cell.
 */
export function SkillsMatrix({ groups }: SkillsMatrixProps) {
  const [active, setActive] = useState(0)
  const baseId = useId()
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const group = groups[active]
  const tabId = (index: number) => `${baseId}-tab-${index}`
  const panelId = `${baseId}-panel`

  function select(index: number) {
    const next = (index + groups.length) % groups.length
    setActive(next)
    tabRefs.current[next]?.focus()
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const keys: Record<string, () => void> = {
      ArrowDown: () => select(active + 1),
      ArrowRight: () => select(active + 1),
      ArrowUp: () => select(active - 1),
      ArrowLeft: () => select(active - 1),
      Home: () => select(0),
      End: () => select(groups.length - 1),
    }
    const action = keys[event.key]
    if (action) {
      event.preventDefault()
      action()
    }
  }

  const usedIn = new Set(group.skills.flatMap((skill) => skill.projects))

  return (
    <div className={styles.layout} data-reveal>
      <div role="tablist" aria-label="Skill categories" className={styles.tabs}>
        {groups.map((item, index) => (
          <button
            key={item.title}
            ref={(element) => {
              tabRefs.current[index] = element
            }}
            id={tabId(index)}
            type="button"
            role="tab"
            aria-selected={index === active}
            aria-controls={panelId}
            tabIndex={index === active ? 0 : -1}
            className={styles.tab}
            onClick={() => setActive(index)}
            onKeyDown={onKeyDown}
          >
            <span className={styles.tabIndex} aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className={styles.tabName}>{item.title}</span>
            <span className={styles.tabCount}>
              {item.skills.length}
              <span className="visually-hidden"> skills</span>
            </span>
          </button>
        ))}
      </div>

      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={tabId(active)}
        tabIndex={0}
        className={styles.panel}
        data-spotlight
      >
        <div className={styles.panelHead}>
          <div>
            <h3 className={styles.panelTitle}>{group.title}</h3>
            <p className={styles.blurb}>{group.blurb}</p>
          </div>
          <p className={styles.summary}>
            <strong>{group.skills.length}</strong> skills · used in <strong>{usedIn.size}</strong>{' '}
            {usedIn.size === 1 ? 'project' : 'projects'}
          </p>
        </div>

        <table className={styles.matrix}>
          <caption className="visually-hidden">{group.title} skills and the projects that use them</caption>
          <thead>
            <tr>
              <th scope="col" className={styles.skillHead}>
                Skill
              </th>
              {columns.map((column) => (
                <th key={column.slug} scope="col" className={styles.projectHead}>
                  <a href={`#project-${column.slug}`} title={column.title}>
                    {/* Full name on wide screens, short code on small ones; one hidden label for screen readers. */}
                    <span className={styles.full} aria-hidden="true">
                      {column.title}
                    </span>
                    <span className={styles.code} aria-hidden="true">
                      {column.code}
                    </span>
                    <span className="visually-hidden">{column.title}</span>
                  </a>
                </th>
              ))}
            </tr>
          </thead>
          {/* Keyed by category, so switching tabs re-runs the row entrance. */}
          <tbody key={group.title}>
            {group.skills.map((skill, row) => (
              <tr key={skill.name} style={{ '--i': row } as CSSProperties}>
                <th scope="row" className={styles.skillName}>
                  {skill.name}
                </th>
                {columns.map((column) => {
                  const used = skill.projects.includes(column.slug)
                  const assisted = used && (skill.assisted?.includes(column.slug) ?? false)
                  return (
                    <td key={column.slug} className={styles.cell}>
                      {assisted ? (
                        // A labelled pill instead of a dot: "AI-assisted" on wide screens, "AI" on narrow ones.
                        <span className={styles.aiTag}>
                          <span className={styles.aiFull}>AI-assisted</span>
                          <span className={styles.aiShort} aria-hidden="true">
                            AI
                          </span>
                        </span>
                      ) : (
                        <span className={used ? styles.dot : styles.empty}>
                          <span className="visually-hidden">{used ? 'Used' : 'Not used'}</span>
                        </span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Explains the label once. Visual only: the cells already read "Used" or "AI-assisted". */}
        <p className={styles.key} aria-hidden="true">
          <span>
            <span className={styles.dot} /> Built myself
          </span>
          <span>
            <span className={styles.aiTag}>AI-assisted</span> Directed and reviewed by me, not hand-written
          </span>
        </p>

        {/* Key for the short column codes on small screens. */}
        <p className={styles.legend} aria-hidden="true">
          {columns.map((column) => (
            <span key={column.slug}>
              <b>{column.code}</b> {column.title}
            </span>
          ))}
        </p>
      </div>
    </div>
  )
}
