import { flushSync } from 'react-dom'

/**
 * Switches the color theme with a pixel "diamond wipe": the new theme is
 * revealed through a diamond that grows from the clicked button in about ten
 * chunky steps (see global.css), instead of every color fading.
 *
 * - Uses the View Transitions API: the browser snapshots the old page, applies
 *   the change, and animates the new page in over the snapshot.
 * - While switching, `data-theme-switching` on <html> turns off all color
 *   transitions, so nothing fades underneath the wipe.
 * - Reduced motion, or a browser without View Transitions: the switch is
 *   instant (still no fade).
 */
export function switchThemeWithWipe(origin: { x: number; y: number } | null, apply: () => void) {
  const root = document.documentElement
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!('startViewTransition' in document) || reduceMotion) {
    root.dataset.themeSwitching = 'instant'
    flushSync(apply)
    // Re-enable transitions after the new colors have painted.
    requestAnimationFrame(() => requestAnimationFrame(() => delete root.dataset.themeSwitching))
    return
  }

  const x = origin?.x ?? window.innerWidth / 2
  const y = origin?.y ?? window.innerHeight / 2
  // A diamond covers a point when |dx| + |dy| ≤ r, so the radius that just
  // reaches the farthest screen corner spreads all ten steps over the page.
  const w = window.innerWidth
  const h = window.innerHeight
  const radius = Math.max(x, w - x) + Math.max(y, h - y)
  root.style.setProperty('--wipe-x', `${Math.round(x)}px`)
  root.style.setProperty('--wipe-y', `${Math.round(y)}px`)
  root.style.setProperty('--wipe-r', `${Math.ceil(radius)}px`)
  root.dataset.themeSwitching = 'wipe'

  const transition = document.startViewTransition(() => flushSync(apply))
  transition.finished.finally(() => {
    delete root.dataset.themeSwitching
    root.style.removeProperty('--wipe-x')
    root.style.removeProperty('--wipe-y')
    root.style.removeProperty('--wipe-r')
  })
}
