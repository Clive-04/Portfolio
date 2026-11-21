import type { ReactNode } from 'react'
import styles from './Card.module.css'

interface CardProps {
  children: ReactNode
  as?: 'article' | 'div' | 'li'
}

/** A bordered surface. Use `article` for self-contained content like a project. */
export function Card({ children, as: Tag = 'div' }: CardProps) {
  return <Tag className={styles.card}>{children}</Tag>
}
