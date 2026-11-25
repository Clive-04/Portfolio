import { useEffect, useRef, useSyncExternalStore } from 'react'
import { usePreferences } from '../../lib/usePreferences'
import { startCompanion } from './engine'
import { companionEnabled } from './route'
import styles from './Companion.module.css'

function useMedia(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/**
 * A small pixel Clive who walks down the page as the visitor scrolls and
 * teleports into the sidebar mark at the bottom. Decorative only: hidden from
 * assistive technology, never focusable or clickable, and absent in Classic,
 * on narrow screens (no sidebar), and with reduced motion, where the "CB"
 * mark simply stays.
 */
export function Companion() {
  const { design } = usePreferences()
  const wide = useMedia('(min-width: 56rem)')
  const reducedMotion = useMedia('(prefers-reduced-motion: reduce)')
  const enabled = companionEnabled({ pixel: design === 'pixel', wide, reducedMotion })
  const ref = useRef<HTMLDivElement>(null)
  const bubbleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enabled || !ref.current || !bubbleRef.current) return
    try {
      return startCompanion(ref.current, bubbleRef.current, document.querySelector<HTMLElement>('[data-companion-slot]'))
    } catch {
      // Any failure leaves the page and the "CB" mark exactly as they were.
      delete document.documentElement.dataset.companion
      return undefined
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <>
      <div ref={ref} className={styles.sprite} aria-hidden="true" hidden />
      <div ref={bubbleRef} className={styles.bubble} aria-hidden="true" hidden />
    </>
  )
}
