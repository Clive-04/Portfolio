import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { PIXEL_GRID, bitmaps, toPath } from './bitmaps.ts'

describe('pixel icon bitmaps', () => {
  for (const [name, rows] of Object.entries(bitmaps)) {
    it(`${name} is a ${PIXEL_GRID} × ${PIXEL_GRID} grid of '#' and '.'`, () => {
      assert.equal(rows.length, PIXEL_GRID)
      for (const row of rows) assert.match(row, /^[#.]{16}$/)
    })
  }
})

describe('toPath', () => {
  it('merges each horizontal run into one rectangle', () => {
    assert.equal(toPath(['.##.', '#..#']), 'M1 0h2v1h-2zM0 1h1v1h-1zM3 1h1v1h-1z')
  })

  it('returns an empty path for an empty bitmap', () => {
    assert.equal(toPath(['....']), '')
  })
})
