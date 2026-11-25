import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { cues, isSoundEnabled, playSound, setSoundEnabled } from './sound.ts'

describe('sound', () => {
  it('is off until explicitly enabled', () => {
    assert.equal(isSoundEnabled(), false)
  })

  it('does nothing while disabled (no audio objects are created)', () => {
    setSoundEnabled(false)
    assert.doesNotThrow(() => playSound('confirm'))
  })

  it('does not throw where Web Audio is unavailable', () => {
    setSoundEnabled(true)
    assert.doesNotThrow(() => playSound('download'))
    setSoundEnabled(false)
  })

  it('gives every action a short cue of its own', () => {
    const signatures = new Set<string>()
    for (const [name, notes] of Object.entries(cues)) {
      assert.ok(notes.length > 0, `${name} has notes`)
      const end = Math.max(...notes.map((note) => note.at + note.dur))
      assert.ok(end <= 0.4, `${name} lasts ${end}s`)
      signatures.add(JSON.stringify(notes))
    }
    assert.equal(signatures.size, Object.keys(cues).length)
  })
})
