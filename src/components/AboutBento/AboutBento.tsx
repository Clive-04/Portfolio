import { useEffect, useState, type CSSProperties } from 'react'
import type { Profile } from '../../content/types'
import styles from './AboutBento.module.css'

const manilaTime = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'Asia/Manila',
})

/** Live local time in Manila, refreshed every 30 seconds. */
function useManilaTime() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const update = () => setTime(manilaTime.format(new Date()))
    update()
    const timer = window.setInterval(update, 30_000)
    return () => window.clearInterval(timer)
  }, [])
  return time
}

interface Stat {
  value: number
  label: string
}

interface AboutBentoProps {
  profile: Profile
  stats: Stat[]
}

/** About as a bento grid: one large bio tile surrounded by small fact tiles. */
export function AboutBento({ profile, stats }: AboutBentoProps) {
  const time = useManilaTime()
  const tile = (index: number) => ({ '--reveal-delay': `${index * 70}ms` }) as CSSProperties

  return (
    <div className={styles.grid}>
      <article className={`${styles.tile} ${styles.bio}`} data-reveal data-spotlight style={tile(0)}>
        {profile.about.map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
      </article>

      <section className={`${styles.tile} ${styles.look}`} data-reveal style={tile(1)} aria-label="Looking for">
        <p className={styles.label}>
          <span className={styles.dot} aria-hidden="true" />
          Looking for
        </p>
        <p className={styles.lookText}>{profile.lookingFor}</p>
      </section>

      <section className={`${styles.tile} ${styles.clock}`} data-reveal style={tile(2)} aria-label="Location">
        <p className={styles.label}>Based in</p>
        <p className={styles.big}>Manila</p>
        <p className={styles.muted}>
          Philippines · <span className={styles.time}>{time || '—'}</span> local time
        </p>
      </section>

      <section className={`${styles.tile} ${styles.stats}`} data-reveal data-spotlight style={tile(3)} aria-label="In numbers">
        <dl className={styles.statList}>
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={`${styles.tile} ${styles.focus}`} data-reveal data-spotlight style={tile(4)} aria-label="Focus">
        <p className={styles.label}>Focus</p>
        <ul role="list" className={styles.focusList}>
          {profile.focus.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
