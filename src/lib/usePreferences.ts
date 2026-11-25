import { createContext, useContext } from 'react'
import type { ColorTheme, DesignMode, Preferences } from './preferences'

export interface PreferencesContextValue extends Preferences {
  setDesign: (design: DesignMode) => void
  setColorTheme: (theme: ColorTheme) => void
  setSound: (on: boolean) => void
  dismissSoundPrompt: () => void
}

export const PreferencesContext = createContext<PreferencesContextValue | null>(null)

/** Display and sound preferences. Must be used inside <PreferencesProvider>. */
export function usePreferences(): PreferencesContextValue {
  const value = useContext(PreferencesContext)
  if (!value) throw new Error('usePreferences must be used inside <PreferencesProvider>')
  return value
}
