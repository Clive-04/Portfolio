import { useEffect } from 'react'
import { playSound } from './sound'
import { soundFor } from './soundFor'

/**
 * Plays interface sounds for actions anywhere on the page, without each
 * component having to know about sound. The rules live in `soundFor`:
 * section links, downloads, email and external links, the phone menu, and
 * any element with `data-sound`. Dialogs play open / back when they open
 * and close. Skill tabs play their own cue (they also change on arrow keys).
 *
 * `playSound` is silent unless the visitor turned sound on in the pixel design.
 */
export function useInterfaceSounds() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!(event.target instanceof Element)) return
      const control = event.target.closest('a, button')
      if (!control) return
      const sound = soundFor({
        tag: control.tagName === 'A' ? 'a' : 'button',
        href: control.getAttribute('href'),
        download: control.hasAttribute('download'),
        newTab: control.getAttribute('target') === '_blank',
        dataSound: control.getAttribute('data-sound'),
        expanded: control.getAttribute('aria-expanded'),
      })
      if (sound) playSound(sound)
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
