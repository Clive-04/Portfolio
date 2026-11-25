import styles from './SiteFooter.module.css'

// Read once when the module loads, so rendering stays pure.
const currentYear = new Date().getFullYear()

interface SiteFooterProps {
  name: string
}

export function SiteFooter({ name }: SiteFooterProps) {
  return (
    <footer className={styles.footer} data-companion-ledge>
      <div className={styles.inner}>
        <p>
          © {currentYear} {name}. All rights reserved.
        </p>
        <a href="#top">Back to top</a>
      </div>
    </footer>
  )
}
