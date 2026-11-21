import type { ReactNode } from 'react'
import styles from './ButtonLink.module.css'

interface ButtonLinkProps {
  href: string
  children: ReactNode
  variant?: 'primary' | 'secondary'
  /** Opens in a new tab. `noopener noreferrer` stops the new page from controlling this one. */
  external?: boolean
  download?: boolean
}

export function ButtonLink({ href, children, variant = 'primary', external = false, download = false }: ButtonLinkProps) {
  return (
    <a
      href={href}
      className={`${styles.button} ${styles[variant]}`}
      {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
      {...(download && { download: true })}
    >
      {children}
      {external && <span className="visually-hidden"> (opens in a new tab)</span>}
    </a>
  )
}
