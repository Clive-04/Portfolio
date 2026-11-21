import { useEffect } from 'react'

/**
 * Fades elements marked with `data-reveal` up into view as they scroll in.
 *
 * Content is only hidden after this runs and adds `motion-ready` to <html>,
 * and only when the visitor has not asked for reduced motion. Without
 * JavaScript, or with reduced motion, everything is simply visible.
 */
export function useReveal() {
  useEffect(() => {
    const prefersMotion = window.matchMedia('(prefers-reduced-motion: no-preference)').matches
    if (!prefersMotion || !('IntersectionObserver' in window)) return

    const root = document.documentElement
    root.classList.add('motion-ready')

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.setAttribute('data-revealed', '')
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )
    document.querySelectorAll('[data-reveal]').forEach((element) => observer.observe(element))

    return () => {
      observer.disconnect()
      root.classList.remove('motion-ready')
    }
  }, [])
}
