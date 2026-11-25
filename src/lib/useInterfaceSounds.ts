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
let skippedToggles = 0
let skipUntil = 0

/**
 * Skips the next two dialog cues (one close, one open). Previous/Next closes
 * one case study and opens another; without this, those cues would play on
 * top of the navigate cue. `toggle` events arrive asynchronously, so the skip
 * is counted rather than timed, with a short expiry in case a browser never
 * fires them; closing the dialog right afterwards still plays "back".
 */
export function quietDialogSounds() {
  skippedToggles = 2
  skipUntil = performance.now() + 1500
}

export function useInterfaceSounds() {
  useEffect(() => {
    // Capture phase: runs before React's handlers, so `aria-expanded` is still
    // the state *before* the click (open when expanding, back when collapsing).
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
      if (skippedToggles > 0 && performance.now() < skipUntil) {
        skippedToggles -= 1
        return
      }
      skippedToggles = 0
      const state = (event as ToggleEvent).newState
      playSound(state === 'open' ? 'open' : 'back')
    }

    document.addEventListener('click', onClick, true)
    document.addEventListener('toggle', onToggle, true)
    return () => {
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('toggle', onToggle, true)
    }
  }, [])
}
