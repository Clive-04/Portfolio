import type { CSSProperties } from 'react'
import type { Certification } from '../../content/types'
import { formatMonthYear } from '../../lib/format'
import { Icon } from '../Icon/Icon'
import styles from './CertificationList.module.css'

interface CertificationListProps {
  items: Certification[]
  /** `featured`: large credential cards. `compact`: a dense wall of course badges. */
  variant?: 'featured' | 'compact'
}

function VerifyLink({ item, compact }: { item: Certification; compact?: boolean }) {
  if (!item.verificationUrl) return null
  return (
    <a
      className={compact ? styles.verifyCompact : styles.verify}
      href={item.verificationUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Icon name="shield" />
      Verify
      <span className="visually-hidden"> {item.name} (opens in a new tab)</span>
    </a>
  )
}

export function CertificationList({ items, variant = 'featured' }: CertificationListProps) {
  const compact = variant === 'compact'
  return (
    <ul role="list" className={compact ? styles.wall : styles.grid}>
      {items.map((item, index) => (
        <li
          key={item.name}
          className={compact ? styles.badge : styles.card}
          data-reveal
          data-spotlight
          style={{ '--reveal-delay': `${(index % 3) * 70}ms` } as CSSProperties}
        >
          {/* Issuer seal: a ringed monogram with a small verified tick. */}
          <span className={styles.seal} aria-hidden="true">
            <span className={styles.sealInner}>{item.issuerMark}</span>
            {item.verificationUrl && (
              <span className={styles.sealTick}>
                <Icon name="check" />
              </span>
            )}
          </span>

          <div className={styles.text}>
            {!compact && <p className={styles.kind}>Certification</p>}
            <h4 className={styles.name}>{item.name}</h4>
            <p className={styles.issuer}>{item.issuer}</p>
            {!compact && (
              <ul role="list" className={styles.skills} aria-label="Skills covered">
                {item.skills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles.footer}>
            <p className={styles.dates}>
              {item.issued && <span>Issued {formatMonthYear(item.issued)}</span>}
              {item.expires && <span>Valid until {formatMonthYear(item.expires)}</span>}
              {item.credentialId && (
                <span>
                  ID <code>{item.credentialId}</code>
                </span>
              )}
            </p>
            <VerifyLink item={item} compact={compact} />
          </div>
        </li>
      ))}
    </ul>
  )
}
