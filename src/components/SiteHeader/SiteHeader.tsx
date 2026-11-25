import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import { sections, type SectionId } from '../../content/sections'
import { DisplayControls } from '../DisplayControls/DisplayControls'
import { PixelIcon } from '../PixelIcon/PixelIcon'
import type { PixelIconName } from '../PixelIcon/bitmaps'
import styles from './SiteHeader.module.css'

/** "Clive Owen S. Benito" → "CB": first and last name initials. */
function initials(name: string) {
  const parts = name.split(' ').filter((part) => !part.endsWith('.'))
  return `${parts[0]?.[0] ?? ''}${parts.at(-1)?.[0] ?? ''}`
}

/** The last section is shown as a call-to-action button instead of a plain link. */
const navLinks = sections.slice(0, -1)
const ctaSection = sections[sections.length - 1]

/** Pixel design only: the icon beside each navigation link. */
const sectionIcons: Record<SectionId, PixelIconName> = {
  about: 'person',
  projects: 'monitor',
  skills: 'bag',
  resume: 'disk',
  certifications: 'emblem',
  contact: 'envelope',
}

interface SiteHeaderProps {
  name: string
}

/**
 * The site header. Classic shows it as a sticky top bar; the pixel design
 * shows the same markup as a fixed sidebar on wide screens. On narrow
 * screens both use the same accessible menu button.
 */
export function SiteHeader({ name }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const menuId = useId()
  const toggleRef = useRef<HTMLButtonElement>(null)
  const progressRef = useRef<HTMLSpanElement>(null)

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

  // Header elevation and the reading-progress line. The progress bar is
  // updated directly (no React state) so scrolling never re-renders the page.
  useEffect(() => {
    let frame = 0
    function update() {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0
      progressRef.current?.style.setProperty('--progress', String(progress))
      setScrolled(window.scrollY > 8)
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  // Highlight the section currently in the middle of the screen.
  useEffect(() => {
    const targets = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => element !== null)
    if (targets.length === 0 || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    targets.forEach((target) => observer.observe(target))
    return () => observer.disconnect()
  }, [])

  return (
    <header className={styles.header} data-scrolled={scrolled}>
      <a className={styles.skipLink} href="#main">
        Skip to content
      </a>
      <div className={styles.inner}>
        <a className={styles.brand} href="#top">
          <span className={styles.mark} aria-hidden="true">
            {initials(name)}
            {/* Pixel companion slot: shown only after it teleports here (html[data-companion="sidebar"]). */}
            <span className={styles.companionSlot} data-companion-slot />
          </span>
          <span className={styles.brandName}>{name}</span>
        </a>

        <button
          ref={toggleRef}
          type="button"
          className={styles.toggle}
          aria-expanded={menuOpen}
          aria-controls={menuId}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className={styles.toggleIcon} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          {menuOpen ? 'Close' : 'Menu'}
        </button>

        {/* Everything the menu button shows and hides on narrow screens. */}
        <div id={menuId} className={styles.panel} data-open={menuOpen}>
          {/* Pixel design only: a small "World map" caption. The nav keeps its "Main" label. */}
          <p className={styles.mapLabel} aria-hidden="true">
            World map
          </p>
          <nav aria-label="Main">
            <ul role="list" className={styles.list}>
              {navLinks.map((section, index) => (
                <li key={section.id} style={{ '--i': index } as CSSProperties}>
                  <a
                    className={styles.link}
                    href={`#${section.id}`}
                    data-icon={sectionIcons[section.id]}
                    aria-current={activeId === section.id ? 'location' : undefined}
                    onClick={() => setMenuOpen(false)}
                  >
                    <PixelIcon name={sectionIcons[section.id]} size={32} className={styles.linkIcon} />
                    {section.label}
                  </a>
                </li>
              ))}
              <li style={{ '--i': navLinks.length } as CSSProperties}>
                <a
                  className={styles.cta}
                  href={`#${ctaSection.id}`}
                  data-icon={sectionIcons[ctaSection.id]}
                  aria-current={activeId === ctaSection.id ? 'location' : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  <PixelIcon name={sectionIcons[ctaSection.id]} size={32} className={styles.linkIcon} />
                  {ctaSection.label}
                  <span className={styles.ctaArrow} aria-hidden="true">
                    →
                  </span>
                </a>
              </li>
            </ul>
          </nav>
          <DisplayControls />
        </div>
      </div>
      <span ref={progressRef} className={styles.progress} aria-hidden="true" />
    </header>
  )
}
