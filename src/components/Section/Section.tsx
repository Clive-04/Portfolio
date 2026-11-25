import type { ReactNode } from 'react'
import { sectionMotif, type SectionId } from '../../content/sections'
import styles from './Section.module.css'

interface SectionProps {
  id: SectionId
  title: string
  /** Two-digit label shown above the title, e.g. "01". */
  index?: string
  intro?: string
  /** `band` = tinted background; `ink` = dark panel. */
  tone?: 'plain' | 'band' | 'ink'
  children: ReactNode
}

/** A page section with a linked heading, used by every part of the page. */
export function Section({ id, title, index, intro, tone = 'plain', children }: SectionProps) {
  const headingId = `${id}-heading`
  const motif = sectionMotif(id)
  return (
    <section id={id} aria-labelledby={headingId} className={styles.section} data-tone={tone} data-companion-ledge>
      <div className={styles.inner}>
        <header className={styles.header} data-reveal>
          {index && (
            <span className={styles.bigIndex} aria-hidden="true">
              {index}
            </span>
          )}
          {/* Pixel design: "01 · Inventory". Decorative; the heading below is what assistive tech reads. */}
          {index && (
            <p className={styles.index} aria-hidden="true">
              <span>{index}</span>
              {motif && <span className={styles.motif}>{motif}</span>}
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
