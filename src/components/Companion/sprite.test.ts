import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { SPRITE_H, SPRITE_W, animations, palette } from './sprite.ts'

const roles = new Set(Object.keys(palette))

describe('companion sprite', () => {
  for (const [name, clip] of Object.entries(animations)) {
    it(`${name}: every frame is ${SPRITE_W} × ${SPRITE_H} and only uses known colour roles`, () => {
      clip.frames.forEach((frame, i) => {
        assert.equal(frame.length, SPRITE_H, `frame ${i}`)
        frame.forEach((line, y) => {
          assert.equal(line.length, SPRITE_W, `frame ${i} row ${y}: "${line}"`)
          for (const ch of line) assert.ok(ch === '.' || roles.has(ch), `unknown role ${ch} in frame ${i} row ${y}`)
        })
      })
    })

    it(`${name}: has one timing per frame`, () => {
      assert.equal(clip.ms.length, clip.frames.length)
      if (clip.loop) assert.ok(clip.ms.every((ms) => ms > 0))
    })
  }

  it('fits a 4-bit indexed PNG (15 colours plus transparency)', () => {
    assert.ok(Object.keys(palette).length <= 15)
  })

  it('keeps the feet on the bottom row while standing, walking, and in the sidebar pose', () => {
    for (const frame of [animations.idle.frames[0], animations.walkDown.frames[0], animations.walkRight.frames[0], animations.sidebar.frames[0]])
      assert.match(frame[SPRITE_H - 1], /[^.]/)
  })

  it('walks left as the mirror of walking right', () => {
    animations.walkLeft.frames.forEach((frame, i) =>
      assert.deepEqual(frame, animations.walkRight.frames[i].map((line) => [...line].reverse().join(''))),
    )
  })
})
