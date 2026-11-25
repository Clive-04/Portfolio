import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { SPRITE_H, SPRITE_W, frames, palette, toRuns } from './sprite.ts'

const named = {
  idle: frames.idle,
  blink: frames.blink,
  ...Object.fromEntries(frames.walkDown.map((f, i) => [`walkDown ${i}`, f])),
  ...Object.fromEntries(frames.walkSide.map((f, i) => [`walkSide ${i}`, f])),
  ...Object.fromEntries(frames.teleport.map((f, i) => [`teleport ${i}`, f])),
}
const roles = new Set(Object.keys(palette))

describe('companion sprite', () => {
  for (const [name, frame] of Object.entries(named)) {
    it(`${name} is ${SPRITE_W} × ${SPRITE_H} and only uses known colour roles`, () => {
      assert.equal(frame.length, SPRITE_H)
      frame.forEach((line, y) => {
        assert.equal(line.length, SPRITE_W, `row ${y}: "${line}"`)
        for (const ch of line) assert.ok(ch === '.' || roles.has(ch), `unknown role ${ch} in row ${y}`)
      })
    })
  }

  it('has four-step walks facing down and sideways, and four teleport frames', () => {
    assert.equal(frames.walkDown.length, 4)
    assert.equal(frames.walkSide.length, 4)
    assert.equal(frames.teleport.length, 4)
  })

  it('builds one path per colour role', () => {
    assert.deepEqual(toRuns(['.oo.', 'o..h']), { o: 'M1 0h2v1h-2zM0 1h1v1h-1z', h: 'M3 1h1v1h-1z' })
  })
})
