import { useEffect, useRef, useSyncExternalStore } from 'react'
import { usePreferences } from '../../lib/usePreferences'
import { startCompanion, type CompanionHandle } from './engine'
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

/** The Day/Night switch is a 600 ms pixel wipe; his reaction waits for it to finish. */
const AFTER_THEME_WIPE_MS = 650

/**
 * A small pixel Clive who visits one card per section as the visitor
 * scrolls, says a line, performs a small action, says goodbye at Contact,
 * and settles into the brand mark. Decorative only: hidden from assistive
 * technology, never focusable or clickable, and absent in Classic. With
 * reduced motion he is a still figure (no walking, waving, or teleporting).
 */
export function Companion() {
  const { design, colorTheme, sound } = usePreferences()
  const reducedMotion = useMedia('(prefers-reduced-motion: reduce)')
  const enabled = companionEnabled({ pixel: design === 'pixel' })
  const ref = useRef<HTMLDivElement>(null)
  const bubbleRef = useRef<HTMLDivElement>(null)
  const handle = useRef<CompanionHandle | null>(null)

  useEffect(() => {
    if (!enabled || !ref.current || !bubbleRef.current) return
    try {
      handle.current = startCompanion(
        ref.current,
        bubbleRef.current,
        document.querySelector<HTMLElement>('[data-companion-slot]'),
        reducedMotion,
      )
    } catch {
      // Any failure leaves the page and the "CB" mark exactly as they were.
      delete document.documentElement.dataset.companion
      return undefined
    }
    return () => {
      handle.current?.stop()
      handle.current = null
    }
  }, [enabled, reducedMotion])

  // Reactions to the visitor's own changes (not the initial values).
  const first = useRef({ colorTheme, sound })
  useEffect(() => {
    if (colorTheme === first.current.colorTheme) return
    first.current.colorTheme = colorTheme
    const id = window.setTimeout(() => handle.current?.react(colorTheme === 'day' ? 'shield' : 'lantern'), AFTER_THEME_WIPE_MS)
    return () => window.clearTimeout(id)
  }, [colorTheme])
  useEffect(() => {
    if (sound === first.current.sound) return
    first.current.sound = sound
    if (sound) handle.current?.react('music')
  }, [sound])

  if (!enabled) return null
  return (
    <>
      <div ref={ref} className={styles.sprite} aria-hidden="true" hidden />
      <div ref={bubbleRef} className={styles.bubble} aria-hidden="true" hidden />
    </>
  )
}
