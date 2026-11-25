/**
 * Tests for the preference helpers. Run with `npm test` (Node's built-in test
 * runner; Node 24 runs TypeScript directly by stripping the types).
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import {
  DEFAULT_DESIGN,
  STORAGE_KEYS,
  loadPreferences,
  parseColorTheme,
  parseDesign,
  readValue,
  writeValue,
  type StorageLike,
} from './preferences.ts'

function memoryStorage(initial: Record<string, string> = {}): StorageLike & { data: Map<string, string> } {
  const data = new Map(Object.entries(initial))
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  }
}

const throwingStorage: StorageLike = {
  getItem: () => {
    throw new Error('SecurityError')
  },
  setItem: () => {
    throw new Error('QuotaExceededError')
  },
}

describe('loadPreferences', () => {
  it('uses the defaults on a first visit', () => {
    const prefs = loadPreferences(memoryStorage(), false)
    assert.deepEqual(prefs, {
      design: 'pixel',
      colorTheme: 'day',
      colorThemeChosen: false,
      sound: false,
      soundPromptDismissed: false,
    })
    assert.equal(DEFAULT_DESIGN, 'pixel')
  })

  it('keeps a saved Classic choice', () => {
    assert.equal(loadPreferences(memoryStorage({ [STORAGE_KEYS.design]: 'classic' }), false).design, 'classic')
  })

  it('follows the system dark setting until a theme is chosen', () => {
    assert.equal(loadPreferences(memoryStorage(), true).colorTheme, 'night')
  })

  it('restores saved choices', () => {
    const storage = memoryStorage({
      [STORAGE_KEYS.design]: 'pixel',
      [STORAGE_KEYS.colorTheme]: 'night',
      [STORAGE_KEYS.sound]: 'on',
      [STORAGE_KEYS.soundPromptDismissed]: 'true',
    })
    assert.deepEqual(loadPreferences(storage, false), {
      design: 'pixel',
      colorTheme: 'night',
      colorThemeChosen: true,
      sound: true,
      soundPromptDismissed: true,
    })
  })

  it('a saved theme wins over the system setting', () => {
    const storage = memoryStorage({ [STORAGE_KEYS.colorTheme]: 'day' })
    assert.equal(loadPreferences(storage, true).colorTheme, 'day')
  })

  it('ignores invalid saved values', () => {
    const storage = memoryStorage({
      [STORAGE_KEYS.design]: 'retro',
      [STORAGE_KEYS.colorTheme]: 'dark',
      [STORAGE_KEYS.sound]: 'yes',
    })
    const prefs = loadPreferences(storage, false)
    assert.equal(prefs.design, 'pixel')
    assert.equal(prefs.colorTheme, 'day')
    assert.equal(prefs.colorThemeChosen, false)
    assert.equal(prefs.sound, false)
  })

  it('keeps sound off when storage is unavailable or throws', () => {
    assert.equal(loadPreferences(null, false).sound, false)
    assert.equal(loadPreferences(throwingStorage, false).sound, false)
    assert.equal(loadPreferences(throwingStorage, false).design, 'pixel')
  })
})

describe('readValue and writeValue', () => {
  it('round-trips a value', () => {
    const storage = memoryStorage()
    assert.equal(writeValue(storage, STORAGE_KEYS.design, 'pixel'), true)
    assert.equal(readValue(storage, STORAGE_KEYS.design), 'pixel')
  })

  it('reports failure instead of throwing', () => {
    assert.equal(writeValue(throwingStorage, STORAGE_KEYS.design, 'pixel'), false)
    assert.equal(writeValue(null, STORAGE_KEYS.design, 'pixel'), false)
    assert.equal(readValue(throwingStorage, STORAGE_KEYS.design), null)
  })
})

describe('parsers', () => {
  it('accept only known values', () => {
    assert.equal(parseDesign('pixel'), 'pixel')
    assert.equal(parseDesign('PIXEL'), null)
    assert.equal(parseColorTheme('night'), 'night')
    assert.equal(parseColorTheme(null), null)
  })
})

describe('public/theme-init.js', () => {
  const script = readFileSync(new URL('../../public/theme-init.js', import.meta.url), 'utf8')

  it('reads the same storage keys as the app', () => {
    assert.ok(script.includes(`'${STORAGE_KEYS.design}'`))
    assert.ok(script.includes(`'${STORAGE_KEYS.colorTheme}'`))
  })

  it('defaults to the pixel design, like DEFAULT_DESIGN', () => {
    assert.match(script, new RegExp(`design = '${DEFAULT_DESIGN}'`))
  })
})
