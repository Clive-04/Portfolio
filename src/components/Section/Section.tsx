import type { ReactNode } from 'react'
import styles from './Section.module.css'

interface SectionProps {
  id: string
  title: string
  intro?: string
  children: ReactNode
}

/** A page section with a linked heading, used by every part of the page. */
export function Section({ id, title, intro, children }: SectionProps) {
  const headingId = `${id}-heading`
  return (
    <section id={id} aria-labelledby={headingId} className={styles.section}>
      <div className={styles.inner}>
        <h2 id={headingId} className={styles.title}>
          {title}
        </h2>
        {intro && <p className={styles.intro}>{intro}</p>}
        {children}
      </div>
    </section>
  )
}
