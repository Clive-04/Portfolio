import type { SoundName } from './sound.ts'

/** What the sound rules need to know about a clicked link or button. */
export interface ClickTarget {
  tag: 'a' | 'button'
  href?: string | null
  download?: boolean
  /** Opens in a new tab (`target="_blank"`). */
  newTab?: boolean
  /** Optional `data-sound` override: a cue name, or "none". */
  dataSound?: string | null
  /** `aria-expanded` before the click, for menu buttons. */
  expanded?: string | null
}

const names: readonly SoundName[] = ['navigate', 'confirm', 'back', 'open', 'download']

/**
 * The cue for a click, or null for none. Controls that play their own sound
 * (display controls, the sound prompt) and dialogs (handled by their
 * open/close events) match no rule here, so nothing plays twice.
 *
 * - `data-sound="…"` wins (e.g. Previous/Next, the pause button).
 * - Links: download → download; `#section` → navigate; email or an external
 *   page (Verify, Credly, LinkedIn, GitHub, Live, Code) → confirm.
 * - Buttons with `aria-expanded` (the phone menu): open when expanding, back when collapsing.
 */
export function soundFor(target: ClickTarget): SoundName | null {
  if (target.dataSound) {
    return names.includes(target.dataSound as SoundName) ? (target.dataSound as SoundName) : null
  }
  if (target.tag === 'a') {
    const href = target.href ?? ''
    if (target.download) return 'download'
    if (href.startsWith('#')) return 'navigate'
    if (href.startsWith('mailto:') || target.newTab || /^https?:\/\//.test(href)) return 'confirm'
    return null
  }
  if (target.expanded === 'true') return 'back'
  if (target.expanded === 'false') return 'open'
  return null
}
