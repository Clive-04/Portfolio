import { usePreferences } from '../../lib/usePreferences'
import { PixelIcon } from '../PixelIcon/PixelIcon'
import styles from './DisplayControls.module.css'

/**
 * Display controls in the header/sidebar.
 *
 * - "Pixel mode" switch: Classic ↔ Pixel (shown in both designs during the rollout).
 * - Day / Night: the pixel color theme (pixel design only).
 *
 * Switches use role="switch" with a fixed name, so screen readers announce
 * "Pixel mode, switch, on/off" and the name never changes with the state.
 */
export function DisplayControls() {
  const { design, colorTheme, setDesign, setColorTheme } = usePreferences()
  const isPixel = design === 'pixel'

  return (
    <div className={styles.controls}>
      {isPixel && (
        <div role="group" aria-label="Color theme" className={styles.segmented}>
          <button
            type="button"
            className={styles.button}
            aria-pressed={colorTheme === 'day'}
            onClick={() => setColorTheme('day')}
          >
            <PixelIcon name="sun" className={styles.icon} />
            Day
          </button>
          <button
            type="button"
            className={styles.button}
            aria-pressed={colorTheme === 'night'}
            onClick={() => setColorTheme('night')}
          >
            <PixelIcon name="moon" className={styles.icon} />
            Night
          </button>
        </div>
      )}

      <button
        type="button"
        role="switch"
        aria-checked={isPixel}
        className={`${styles.button} ${styles.switch}`}
        onClick={() => setDesign(isPixel ? 'classic' : 'pixel')}
      >
        Pixel mode
        <span className={styles.state} aria-hidden="true">
          {isPixel ? 'On' : 'Off'}
        </span>
      </button>
    </div>
  )
}
