import type { ReactNode } from 'react'
import styles from './Section.module.css'

interface SectionProps {
  id: string
  title: string
  /** Two-digit label shown above the title, e.g. "01". */
  index?: string
  intro?: string
  /** `band` = mist-tinted background; `ink` = dark pine panel. */
  tone?: 'plain' | 'band' | 'ink'
  children: ReactNode
}

/** A page section with a linked heading, used by every part of the page. */
export function Section({ id, title, index, intro, tone = 'plain', children }: SectionProps) {
  const headingId = `${id}-heading`
  return (
    <section id={id} aria-labelledby={headingId} className={styles.section} data-tone={tone}>
      <div className={styles.inner}>
        <header className={styles.header} data-reveal>
          {index && (
            <span className={styles.bigIndex} aria-hidden="true">
              {index}
            </span>
          )}
          {index && (
            <p className={styles.index} aria-hidden="true">
              <span>{index}</span>
            </p>
          )}
          <h2 id={headingId} className={styles.title}>
            {title}
          </h2>
          {intro && <p className={styles.intro}>{intro}</p>}
        </header>
        {children}
      </div>
    </section>
  )
}
