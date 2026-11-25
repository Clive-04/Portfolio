import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { SPRITE_GRID, frames, palettes, toRuns } from './sprite.ts'

const all = [frames.idle, frames.blink, ...frames.walk, ...frames.teleport]
const roles = new Set(Object.keys(palettes.day))

describe('companion sprite', () => {
  it('has 16 × 16 frames that only use known colour roles', () => {
    for (const frame of all) {
      assert.equal(frame.length, SPRITE_GRID)
      for (const row of frame) {
        assert.equal(row.length, SPRITE_GRID, row)
        for (const ch of row) assert.ok(ch === '.' || roles.has(ch), `unknown role ${ch}`)
      }
    }
  })

  it('defines every role in both Day and Night', () => {
    assert.deepEqual(Object.keys(palettes.night).sort(), [...roles].sort())
  })

  it('proposes 2 idle, 4 walk, and 4 teleport frames', () => {
    assert.equal(frames.walk.length, 4)
    assert.equal(frames.teleport.length, 4)
  })

  it('builds one path per colour role', () => {
    assert.deepEqual(toRuns(['.oo.', 'o..h']), { o: 'M1 0h2v1h-2zM0 1h1v1h-1z', h: 'M3 1h1v1h-1z' })
  })
})
