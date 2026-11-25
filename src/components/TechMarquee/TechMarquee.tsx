import { useState } from 'react'
import { Icon } from '../Icon/Icon'
import styles from './TechMarquee.module.css'

interface TechMarqueeProps {
  items: string[]
}

/**
 * Two rows of technologies drifting slowly in opposite directions: the top
 * row to the left, the bottom row to the right. Each row holds its items
 * twice and moves by exactly one copy, so the loop is seamless.
 *
 * Moving content needs a way to stop it (WCAG 2.2.2), so there is a pause
 * button; hovering also pauses, and reduced motion keeps it still. The rows
 * are decorative (the Skills section lists the same items), so they are
 * hidden from screen readers; the button is not.
 */
export function TechMarquee({ items }: TechMarqueeProps) {
  const [paused, setPaused] = useState(false)
  const half = Math.ceil(items.length / 2)
  const rows = [items.slice(0, half), items.slice(half)]

  return (
    <div className={styles.marquee} data-paused={paused}>
      <div className={styles.rows} aria-hidden="true">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className={styles.track} data-direction={rowIndex === 0 ? 'left' : 'right'}>
            {[0, 1].map((copy) => (
              <div key={copy} className={styles.group}>
                {row.map((item) => (
                  <span key={item} className={styles.item}>
                    {item}
                    <span className={styles.star}>✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      <button
        type="button"
        className={styles.toggle}
        aria-pressed={paused}
        data-sound="confirm"
        onClick={() => setPaused((value) => !value)}
      >
        <Icon name={paused ? 'play' : 'pause'} />
        <span className="visually-hidden">Pause the moving technology list</span>
      </button>
    </div>
  )
}
