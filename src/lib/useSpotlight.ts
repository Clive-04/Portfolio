import { useEffect } from 'react'

/**
 * Cursor spotlight: elements marked `data-spotlight` get `--mx` / `--my`
 * custom properties with the pointer position inside them, which CSS turns
 * into a soft radial glow. One delegated listener serves the whole page.
 * Mouse and pen only; touch has no hover, so nothing happens there.
 */
export function useSpotlight() {
  useEffect(() => {
    let frame = 0
    let pending: { target: HTMLElement; x: number; y: number } | null = null

    function apply() {
      frame = 0
      if (!pending) return
      const { target, x, y } = pending
      target.style.setProperty('--mx', `${x}px`)
      target.style.setProperty('--my', `${y}px`)
    }

    function onPointerMove(event: PointerEvent) {
      if (event.pointerType === 'touch') return
      const target = (event.target as Element | null)?.closest<HTMLElement>('[data-spotlight]')
      if (!target) return
      const rect = target.getBoundingClientRect()
      pending = { target, x: event.clientX - rect.left, y: event.clientY - rect.top }
      if (!frame) frame = requestAnimationFrame(apply)
    }

    document.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('pointermove', onPointerMove)
    }
  }, [])
}
