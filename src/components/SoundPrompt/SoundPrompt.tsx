import { useId } from 'react'
import { playSound, setSoundEnabled } from '../../lib/sound'
import { usePreferences } from '../../lib/usePreferences'
import { PixelIcon } from '../PixelIcon/PixelIcon'
import styles from './SoundPrompt.module.css'

/**
 * One compact notice on the first pixel-design visit: sound can be turned on
 * for more immersion. It sits in the page flow (never over the navigation or
 * content), is not an alert, and either button dismisses it for good. The
 * Sound switch in the sidebar/menu stays available afterwards.
 */
export function SoundPrompt() {
  const { design, sound, soundPromptDismissed, setSound, dismissSoundPrompt } = usePreferences()
  const titleId = useId()

  if (design !== 'pixel' || sound || soundPromptDismissed) return null

  // The prompt disappears, so hand focus to the main region instead of losing it.
  function moveFocus() {
    document.getElementById('main')?.focus({ preventScroll: true })
  }

  function enable() {
    setSoundEnabled(true)
    setSound(true)
    dismissSoundPrompt()
    playSound('confirm')
    moveFocus()
  }

  function notNow() {
    dismissSoundPrompt()
    moveFocus()
  }

  return (
    <aside className={styles.prompt} aria-labelledby={titleId}>
      <PixelIcon name="speakerOff" size={32} className={styles.icon} />
      <div className={styles.text}>
        <p id={titleId} className={styles.title}>
          Sound is off
        </p>
        <p className={styles.body}>Enable sounds for more immersion.</p>
      </div>
      <div className={styles.actions}>
        <button type="button" className={`${styles.button} ${styles.primary}`} onClick={enable}>
          Enable sound
        </button>
        <button type="button" className={styles.button} onClick={notNow}>
          Not now
        </button>
      </div>
    </aside>
  )
}
