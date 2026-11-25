import type { ReactNode } from 'react'
import { Icon, type IconName } from '../Icon/Icon'
import styles from './ButtonLink.module.css'

interface ButtonLinkProps {
  href: string
  children: ReactNode
  /** `light` and `ghost` are for dark (ink) backgrounds. */
  variant?: 'primary' | 'secondary' | 'light' | 'ghost'
  size?: 'md' | 'sm'
  /** Trailing icon. External links get the "external" arrow automatically. */
  icon?: IconName
  /** Icon before the label, e.g. a brand logo. */
  leadingIcon?: IconName
  /** Opens in a new tab. `noopener noreferrer` stops the new page from controlling this one. */
  external?: boolean
  download?: boolean
  /** Extra data attributes (e.g. the pixel companion's anchor). */
  data?: Record<`data-${string}`, string>
}

export function ButtonLink({
  href,
  children,
  variant = 'primary',
  size = 'md',
  icon,
  leadingIcon,
  external = false,
  download = false,
  data,
}: ButtonLinkProps) {
  const trailing = icon ?? (external ? 'external' : undefined)
  return (
    <a
      href={href}
      className={[styles.button, styles[variant], size === 'sm' && styles.sm].filter(Boolean).join(' ')}
      data-icon={trailing}
      {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
      {...(download && { download: true })}
      {...data}
    >
      {leadingIcon && <Icon name={leadingIcon} className={styles.leading} />}
      <span className={styles.label}>{children}</span>
      {trailing && <Icon name={trailing} className={styles.icon} />}
      {external && <span className="visually-hidden"> (opens in a new tab)</span>}
    </a>
  )
}
