import styles from './TechMarquee.module.css'

interface TechMarqueeProps {
  items: string[]
}

/**
 * Two rows of technologies that slide in opposite directions as the page
 * scrolls (CSS scroll-driven animation). Nothing moves unless the visitor
 * scrolls, so it never animates on its own. Decorative: the same skills are
 * listed in the Skills section, so it is hidden from screen readers.
 */
export function TechMarquee({ items }: TechMarqueeProps) {
  const half = Math.ceil(items.length / 2)
  const rows = [items.slice(0, half), items.slice(half)]
  return (
    <div className={styles.marquee} aria-hidden="true">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className={styles.row} data-direction={rowIndex === 0 ? 'left' : 'right'}>
          {/* Repeated so the row stays filled while it slides. */}
          {[...row, ...row, ...row].map((item, index) => (
            <span key={`${item}-${index}`} className={styles.item}>
              {item}
              <span className={styles.star}>✦</span>
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}
