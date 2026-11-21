import type { ReactNode } from 'react'
import styles from './ButtonLink.module.css'

interface ButtonLinkProps {
  href: string
  children: ReactNode
  /** `light` and `ghost` are for dark (ink) backgrounds. */
  variant?: 'primary' | 'secondary' | 'light' | 'ghost'
  size?: 'md' | 'sm'
  /** Opens in a new tab. `noopener noreferrer` stops the new page from controlling this one. */
  external?: boolean
  download?: boolean
}

export function ButtonLink({
  href,
  children,
  variant = 'primary',
  size = 'md',
  external = false,
  download = false,
}: ButtonLinkProps) {
  return (
    <a
      href={href}
      className={[styles.button, styles[variant], size === 'sm' && styles.sm].filter(Boolean).join(' ')}
      {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
      {...(download && { download: true })}
    >
      {children}
      {external && (
        <>
          <span className={styles.icon} aria-hidden="true">
            ↗
          </span>
          <span className="visually-hidden"> (opens in a new tab)</span>
        </>
      )}
    </a>
  )
}
