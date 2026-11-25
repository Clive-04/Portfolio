import { useEffect } from 'react'
import { playSound } from './sound'

/**
 * Plays interface sounds for actions anywhere on the page, without each
 * component having to know about sound:
 *
 * - a link to a section (`href="#…"`) → navigate
 * - a download link → download
 * - a dialog opening or closing → open / back
 *
 * `playSound` is silent unless the visitor turned sound on in the pixel design.
 */
export function useInterfaceSounds() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!(event.target instanceof Element)) return
      const link = event.target.closest('a')
      if (!link) return
      if (link.hasAttribute('download')) playSound('download')
      else if (link.getAttribute('href')?.startsWith('#')) playSound('navigate')
    }

    // `toggle` does not bubble, so listen in the capture phase.
    function onToggle(event: Event) {
      if (!(event.target instanceof HTMLDialogElement)) return
      const state = (event as ToggleEvent).newState
      playSound(state === 'open' ? 'open' : 'back')
    }

    document.addEventListener('click', onClick)
    document.addEventListener('toggle', onToggle, true)
    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('toggle', onToggle, true)
    }
  }, [])
}
