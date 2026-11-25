import { playSound, setSoundEnabled } from '../../lib/sound'
import { usePreferences } from '../../lib/usePreferences'
import { PixelIcon } from '../PixelIcon/PixelIcon'
import styles from './DisplayControls.module.css'

/**
 * Display controls in the header/sidebar.
 *
 * - Day / Night: the pixel color theme (pixel design only).
 * - Sound: off by default; always visible in the pixel design.
 * - "Switch to Classic" / "Switch to Pixel": Pixel is the main design;
 *   Classic stays available as an alternative look.
 *
 * The Sound switch uses role="switch" with a fixed name, so screen readers
 * announce "Sound, switch, off" and the name never changes with the state.
 */
export function DisplayControls() {
  const { design, colorTheme, sound, setDesign, setColorTheme, setSound } = usePreferences()
  const isPixel = design === 'pixel'

  function chooseTheme(theme: typeof colorTheme) {
    setColorTheme(theme)
    playSound('confirm')
  }

  function toggleSound() {
    if (sound) {
      // Play the "back" cue while sound is still on, then turn it off.
      playSound('back')
      setSound(false)
    } else {
      // Enable synchronously so the confirmation plays inside this click.
      setSoundEnabled(true)
      setSound(true)
      playSound('confirm')
    }
  }

  function toggleDesign() {
    playSound('confirm')
    setDesign(isPixel ? 'classic' : 'pixel')
  }

  return (
    <div className={styles.controls}>
      {isPixel && (
        <>
          <div role="group" aria-label="Color theme" className={styles.segmented}>
            <button
              type="button"
              className={styles.button}
              aria-pressed={colorTheme === 'day'}
              onClick={() => chooseTheme('day')}
            >
              <PixelIcon name="sun" className={styles.icon} />
              Day
            </button>
            <button
              type="button"
              className={styles.button}
              aria-pressed={colorTheme === 'night'}
              onClick={() => chooseTheme('night')}
            >
              <PixelIcon name="moon" className={styles.icon} />
              Night
            </button>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={sound}
            className={`${styles.button} ${styles.switch}`}
            onClick={toggleSound}
          >
            <span className={styles.switchLabel}>
              <PixelIcon name={sound ? 'speaker' : 'speakerOff'} className={styles.icon} />
              Sound
            </span>
            <span className={styles.state} aria-hidden="true">
              {sound ? 'On' : 'Off'}
            </span>
          </button>
        </>
      )}

      {/* An action button that names where it goes, so its label changing is expected. */}
      <button type="button" className={`${styles.button} ${styles.designButton}`} onClick={toggleDesign}>
        {isPixel ? 'Switch to Classic' : 'Switch to Pixel'}
      </button>
    </div>
  )
}
