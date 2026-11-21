import { useEffect, useId, useRef, useState } from 'react'
import { sections } from '../../content/sections'
import styles from './SiteHeader.module.css'

interface SiteHeaderProps {
  name: string
}

export function SiteHeader({ name }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuId = useId()
  const toggleRef = useRef<HTMLButtonElement>(null)

  // Close the mobile menu with Escape and return focus to the toggle button.
  useEffect(() => {
    if (!menuOpen) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        toggleRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  return (
    <header className={styles.header}>
      <a className={styles.skipLink} href="#main">
        Skip to content
      </a>
      <div className={styles.inner}>
        <a className={styles.brand} href="#top">
          {name}
        </a>

        <button
          ref={toggleRef}
          type="button"
          className={styles.toggle}
          aria-expanded={menuOpen}
          aria-controls={menuId}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className={styles.toggleIcon} aria-hidden="true" />
          {menuOpen ? 'Close' : 'Menu'}
        </button>

        <nav aria-label="Main">
          <ul id={menuId} role="list" className={styles.list} data-open={menuOpen}>
            {sections.map((section) => (
              <li key={section.id}>
                <a className={styles.link} href={`#${section.id}`} onClick={() => setMenuOpen(false)}>
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
