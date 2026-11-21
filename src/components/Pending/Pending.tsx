import styles from './Pending.module.css'

interface PendingProps {
  children: string
}

/** Marks content that is intentionally not published yet, instead of using placeholder claims. */
export function Pending({ children }: PendingProps) {
  return (
    <p className={styles.pending}>
      <span className={styles.label}>Pending</span>
      {children}
    </p>
  )
}
