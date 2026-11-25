import { useEffect } from 'react'

/**
 * Fades elements marked with `data-reveal` up into view as they scroll in.
 *
 * Reveals are one-way: once revealed, an element stays visible. Content the
 * visitor has already scrolled past (for example after End, a scrollbar
 * drag, or a fast fling that jumped over it) is revealed too, so scrolling
 * back never finds hidden text. The animation has no forward fill, so
 * nothing is left behind once it has played.
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

    const reveal = (element: Element) => {
      element.setAttribute('data-revealed', '')
      observer.unobserve(element)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // In view, or already above it (scrolled past): reveal and stop watching.
          if (entry.isIntersecting || entry.boundingClientRect.bottom < 0) reveal(entry.target)
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )
    document.querySelectorAll('[data-reveal]').forEach((element) => observer.observe(element))

    // A jump can carry content past the viewport between two observations; catch it once per frame.
    let frame = 0
    const revealPassed = () => {
      frame = 0
      for (const element of document.querySelectorAll('[data-reveal]:not([data-revealed])')) {
        if (element.getBoundingClientRect().bottom < 0) reveal(element)
      }
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(revealPassed)
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      root.classList.remove('motion-ready')
    }
  }, [])
}
