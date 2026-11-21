import type { CSSProperties } from 'react'
import type { Certification } from '../../content/types'
import { formatMonthYear } from '../../lib/format'
import styles from './CertificationList.module.css'

interface CertificationListProps {
  items: Certification[]
  /** `grid` lays smaller items out in two columns on wide screens. */
  layout?: 'list' | 'grid'
}

/** Short issuer monogram for the decorative chip, e.g. "Cisco Networking Academy" → "CN". */
function monogram(issuer: string) {
  const words = issuer.replace(/\(.*?\)/g, '').split(/\s+/).filter(Boolean)
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

export function CertificationList({ items, layout = 'list' }: CertificationListProps) {
  return (
    <ul role="list" className={styles.list} data-layout={layout}>
      {items.map((item, index) => (
        <li
          key={item.name}
          className={styles.item}
          data-reveal
          style={{ '--reveal-delay': `${(index % 4) * 60}ms` } as CSSProperties}
        >
          <span className={styles.chip} aria-hidden="true">
            {monogram(item.issuer)}
          </span>
          <div className={styles.main}>
            <h4 className={styles.name}>{item.name}</h4>
            <p className={styles.issuer}>{item.issuer}</p>
            <p className={styles.skills}>{item.skills.join(' · ')}</p>
          </div>
          <div className={styles.meta}>
            {item.issued && <p>Issued {formatMonthYear(item.issued)}</p>}
            {item.expires && <p>Valid until {formatMonthYear(item.expires)}</p>}
            {item.credentialId && (
              <p>
                ID <code>{item.credentialId}</code>
              </p>
            )}
            {item.verificationUrl && (
              <a className={styles.verify} href={item.verificationUrl} target="_blank" rel="noopener noreferrer">
                Verify<span aria-hidden="true"> ↗</span>
                <span className="visually-hidden"> {item.name} (opens in a new tab)</span>
              </a>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
