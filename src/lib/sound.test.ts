import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { VOLUME, cues, isSoundEnabled, playSound, setSoundEnabled } from './sound.ts'

describe('sound level', () => {
  it('is loud enough to hear at moderate system volume but well below full scale', () => {
    assert.ok(VOLUME >= 0.12 && VOLUME <= 0.25, `VOLUME is ${VOLUME}`)
  })
})

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

  it('keeps the new-tab, skill-tab, and paging cues apart from the others', () => {
    const shape = (name: keyof typeof cues) => cues[name].map((note) => `${note.wave}:${note.freq}>${note.to ?? '-'}`).join(' ')
    for (const fresh of ['external', 'tab', 'page'] as const) {
      for (const other of Object.keys(cues) as (keyof typeof cues)[]) {
        if (other !== fresh) assert.notEqual(shape(fresh), shape(other), `${fresh} vs ${other}`)
      }
    }
    // Slides are what make external and tab sound different from the stepped cues.
    assert.ok(cues.external.some((note) => note.to))
    assert.ok(cues.tab.some((note) => note.to))
  })
})
