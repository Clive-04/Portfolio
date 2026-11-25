import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  STORAGE_KEYS,
  applyToDocument,
  getStorage,
  loadPreferences,
  systemColorTheme,
  writeValue,
  type ColorTheme,
  type DesignMode,
  type Preferences,
} from './preferences'
import { PreferencesContext, type PreferencesContextValue } from './usePreferences'

const darkQuery = '(prefers-color-scheme: dark)'

function prefersDark() {
  return typeof window !== 'undefined' && window.matchMedia?.(darkQuery).matches === true
}

/** Browser UI colour (address bar on phones) for each look. */
const themeColors = { classic: '#0b1615', day: '#fff6d8', night: '#101a33' } as const

/**
 * Owns the visitor's display and sound preferences, saves them, and mirrors
 * the design mode and color theme onto <html> as data attributes.
 */
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(() => loadPreferences(getStorage(), prefersDark()))

  useEffect(() => {
    applyToDocument(document.documentElement, prefs)
    const color = prefs.design === 'classic' ? themeColors.classic : themeColors[prefs.colorTheme]
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color)
  }, [prefs])

  // Until the visitor picks Day or Night, follow the system setting live.
  useEffect(() => {
    if (prefs.colorThemeChosen || !window.matchMedia) return
    const query = window.matchMedia(darkQuery)
    const onChange = () => setPrefs((current) => ({ ...current, colorTheme: systemColorTheme(query.matches) }))
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [prefs.colorThemeChosen])

  const setDesign = useCallback((design: DesignMode) => {
    writeValue(getStorage(), STORAGE_KEYS.design, design)
    setPrefs((current) => ({ ...current, design }))
  }, [])

  const setColorTheme = useCallback((colorTheme: ColorTheme) => {
    writeValue(getStorage(), STORAGE_KEYS.colorTheme, colorTheme)
    setPrefs((current) => ({ ...current, colorTheme, colorThemeChosen: true }))
  }, [])

  const setSound = useCallback((sound: boolean) => {
    writeValue(getStorage(), STORAGE_KEYS.sound, sound ? 'on' : 'off')
    setPrefs((current) => ({ ...current, sound }))
  }, [])

  const dismissSoundPrompt = useCallback(() => {
    writeValue(getStorage(), STORAGE_KEYS.soundPromptDismissed, 'true')
    setPrefs((current) => ({ ...current, soundPromptDismissed: true }))
  }, [])

  const value = useMemo<PreferencesContextValue>(
    () => ({ ...prefs, setDesign, setColorTheme, setSound, dismissSoundPrompt }),
    [prefs, setDesign, setColorTheme, setSound, dismissSoundPrompt],
  )

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}
