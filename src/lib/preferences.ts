/**
 * Display preferences, kept as two separate concerns:
 *
 * 1. Design mode (`data-design` on <html>): `pixel` is the main 8-bit design
 *    and the default; `classic` is the original look, chosen from a button.
 * 2. Color theme (`data-color-theme` on <html>): `day` (light) or `night`
 *    (dark). Only the pixel design reads it; both themes share one layout.
 *
 * Sound and the one-time sound prompt are stored here too. Everything goes
 * through try/catch: storage can be missing or throw (private windows,
 * blocked site data), and the site must still work with the defaults.
 *
 * This module has no imports so Node's test runner can load it directly.
 * `public/theme-init.js` applies the same keys before the first paint; keep
 * the two in sync (a test checks this).
 */

export type DesignMode = 'classic' | 'pixel'
export type ColorTheme = 'day' | 'night'

export const STORAGE_KEYS = {
  design: 'portfolio:design',
  colorTheme: 'portfolio:color-theme',
  sound: 'portfolio:sound',
  soundPromptDismissed: 'portfolio:sound-prompt-dismissed',
} as const

/** Pixel is the main design (2026-11-25); Classic stays available from a button. */
export const DEFAULT_DESIGN: DesignMode = 'pixel'

export interface Preferences {
  design: DesignMode
  colorTheme: ColorTheme
  /** False while the color theme still follows the system setting. */
  colorThemeChosen: boolean
  /** Off by default; sound never plays until the visitor turns it on. */
  sound: boolean
  soundPromptDismissed: boolean
}

/** The subset of the Web Storage API this module uses (easy to fake in tests). */
export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>

/** `localStorage`, or null where it is unavailable or access throws. */
export function getStorage(): StorageLike | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

export function readValue(storage: StorageLike | null, key: string): string | null {
  if (!storage) return null
  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

/** Returns false when the value could not be saved; the choice then lasts for this page view only. */
export function writeValue(storage: StorageLike | null, key: string, value: string): boolean {
  if (!storage) return false
  try {
    storage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

export function parseDesign(value: string | null): DesignMode | null {
  return value === 'classic' || value === 'pixel' ? value : null
}

export function parseColorTheme(value: string | null): ColorTheme | null {
  return value === 'day' || value === 'night' ? value : null
}

export function systemColorTheme(prefersDark: boolean): ColorTheme {
  return prefersDark ? 'night' : 'day'
}

/** Reads saved choices; anything missing or invalid falls back to the defaults. */
export function loadPreferences(storage: StorageLike | null, prefersDark: boolean): Preferences {
  const savedTheme = parseColorTheme(readValue(storage, STORAGE_KEYS.colorTheme))
  return {
    design: parseDesign(readValue(storage, STORAGE_KEYS.design)) ?? DEFAULT_DESIGN,
    colorTheme: savedTheme ?? systemColorTheme(prefersDark),
    colorThemeChosen: savedTheme !== null,
    sound: readValue(storage, STORAGE_KEYS.sound) === 'on',
    soundPromptDismissed: readValue(storage, STORAGE_KEYS.soundPromptDismissed) === 'true',
  }
}

/** Mirrors the two display choices onto <html>, where the CSS reads them. */
export function applyToDocument(root: HTMLElement, prefs: Pick<Preferences, 'design' | 'colorTheme'>) {
  root.dataset.design = prefs.design
  root.dataset.colorTheme = prefs.colorTheme
}
