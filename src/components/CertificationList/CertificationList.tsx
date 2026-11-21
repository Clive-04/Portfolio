import type { Certification } from '../../content/types'
import { formatMonthYear } from '../../lib/format'
import styles from './CertificationList.module.css'

interface CertificationListProps {
  items: Certification[]
}

export function CertificationList({ items }: CertificationListProps) {
  return (
    <ul role="list" className={styles.list}>
      {items.map((item) => (
        <li key={item.name} className={styles.item}>
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
                Credential ID <code>{item.credentialId}</code>
              </p>
            )}
            {item.verificationUrl && (
              <a href={item.verificationUrl} target="_blank" rel="noopener noreferrer">
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
