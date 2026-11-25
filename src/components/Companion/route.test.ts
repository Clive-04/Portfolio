import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  SPRITE_BOX,
  advance,
  buildRoute,
  clearRun,
  companionEnabled,
  docked,
  isClear,
  layoutFor,
  modesFor,
  resolveAnchor,
  type Anchor,
  pixelScale,
  placeBubble,
  positionAt,
  targetAt,
  walkClip,
  walkFrame,
  walkingDistance,
  type Ledge,
  type Rect,
} from './route.ts'

const VH = 800

describe('clearRun', () => {
  it('stands at the right end of an empty ledge and strolls left up to the cap', () => {
    assert.deepEqual(clearRun({ y: 500, x0: 0, x1: 1000 }, []), [1000 - SPRITE_BOX.w - 160, 1000 - SPRITE_BOX.w])
  })

  it('steps left past an obstacle that sits where the sprite would stand', () => {
    const text: Rect = { x: 900, y: 450, w: 100, h: 20 }
    const run = clearRun({ y: 500, x0: 0, x1: 1000 }, [text])!
    assert.ok(run[1] + SPRITE_BOX.w <= 900)
    assert.ok(isClear({ x: run[0], y: 500 - SPRITE_BOX.h, w: run[1] - run[0] + SPRITE_BOX.w, h: SPRITE_BOX.h }, [text]))
  })

  it('returns null when nothing on the ledge is clear', () => {
    assert.equal(clearRun({ y: 500, x0: 0, x1: 300 }, [{ x: 0, y: 440, w: 300, h: 40 }]), null)
  })
})

describe('buildRoute', () => {
  const ledges: Ledge[] = [
    { y: 400, x0: 0, x1: 1000 },
    { y: 1200, x0: 0, x1: 1000 },
  ]

  it('walks down when the path between ledges is clear', () => {
    const route = buildRoute(ledges, [], VH)
    assert.ok(route.every((p) => !p.blink))
    assert.ok(route.every((p, i) => i === 0 || p.y >= route[i - 1].y), 'never walks back up the page')
  })

  it('teleports instead of crossing content between ledges', () => {
    const route = buildRoute(ledges, [{ x: 0, y: 700, w: 1000, h: 100 }], VH)
    assert.equal(route.filter((p) => p.blink).length, 1)
    const blink = route.find((p) => p.blink)!
    assert.equal(blink.y, 1200)
    assert.ok(blink.key < 1200 && blink.key >= route[route.indexOf(blink) - 1].key)
  })

  it('skips ledges with no clear spot and ledges too close to the last one', () => {
    const route = buildRoute(
      [...ledges, { y: 420, x0: 0, x1: 1000 }, { y: 800, x0: 0, x1: 200 }],
      [{ x: 0, y: 730, w: 200, h: 70 }],
      VH,
    )
    assert.deepEqual([...new Set(route.map((p) => p.y))], [400, 1200])
  })

  it('carries the dark-panel flag for the light rim', () => {
    const route = buildRoute([{ y: 400, x0: 0, x1: 1000, dark: true }], [], VH)
    assert.ok(route.every((p) => p.dark))
  })
})

describe('following the scroll', () => {
  const route = buildRoute(
    [
      { y: 400, x0: 0, x1: 1000 },
      { y: 1200, x0: 0, x1: 1000 },
    ],
    [],
    VH,
  )
  const last = route.length - 1

  it('stays on the first ledge above the route and on the last below it', () => {
    assert.equal(targetAt(route, 0), 0)
    assert.equal(targetAt(route, 99999), last)
  })

  it('tracks the viewport line while walking down, and the target only grows as the page scrolls down', () => {
    let previous = -1
    for (let line = 0; line <= 1600; line += 25) {
      const t = targetAt(route, line)
      assert.ok(t >= previous)
      previous = t
    }
    const mid = targetAt(route, 800)
    assert.equal(Math.round(positionAt(route, mid).y), 800)
  })

  it('walks back up the same path when the visitor scrolls up', () => {
    const down = advance(route, 0, last, 10_000)
    assert.equal(down.p, last)
    assert.ok(down.dy > 0 || down.dx !== 0)
    const up = advance(route, last, 0, 10_000)
    assert.equal(up.p, 0)
    assert.equal(walkClip(up.dx, up.dy) === 'walkDown', false)
  })

  it('walks no further than its budget and reports the distance', () => {
    const step = advance(route, 0, last, 30)
    assert.ok(Math.abs(step.walked - 30) < 1e-6)
    assert.ok(step.p > 0 && step.p < last)
  })

  it('stops at a teleport and says where it leads, in both directions', () => {
    const gapped = buildRoute(
      [
        { y: 400, x0: 0, x1: 1000 },
        { y: 1200, x0: 0, x1: 1000 },
      ],
      [{ x: 0, y: 700, w: 1000, h: 100 }],
      VH,
    )
    const b = gapped.findIndex((p) => p.blink)
    const down = advance(gapped, 0, gapped.length - 1, 10_000)
    assert.equal(down.blinkTo, b)
    assert.equal(walkingDistance(gapped, 0, gapped.length - 1), Infinity)
    const up = advance(gapped, gapped.length - 1, 0, 10_000)
    assert.equal(up.blinkTo, b - 1)
  })
})

describe('walk frames', () => {
  it('picks the walk for the direction of travel', () => {
    assert.equal(walkClip(0, 5), 'walkDown')
    assert.equal(walkClip(0, -5), 'walkUp')
    assert.equal(walkClip(5, 0), 'walkRight')
    assert.equal(walkClip(-5, 1), 'walkLeft')
  })

  it('advances one frame per 8 px walked and loops every 4', () => {
    assert.deepEqual([0, 7.9, 8, 16, 24, 32].map((d) => walkFrame(d)), [0, 0, 1, 2, 3, 0])
    assert.equal(walkFrame(9.6, 9.6), 1, 'scaled stride at 125% display scaling')
  })
})

describe('sidebar docking', () => {
  it('docks only at the very bottom', () => {
    assert.equal(docked(false, 4000, 5000), false)
    assert.equal(docked(false, 4999, 5000), true)
  })

  it('stays docked however far the visitor scrolls back up', () => {
    assert.equal(docked(true, 4950, 5000), true)
    assert.equal(docked(true, 0, 5000), true)
  })

  it('never docks on a page too short to scroll', () => {
    assert.equal(docked(false, 0, 0), false)
  })
})

describe('placeBubble', () => {
  const size = { w: 200, h: 36 }
  const bounds = { x0: 0, x1: 1280 }

  it('puts the bubble above his head, tail pointing at him', () => {
    const b = placeBubble(1000, 500, size, [], bounds)!
    assert.equal(b.tail, 'down')
    assert.ok(b.y + size.h <= 500 - SPRITE_BOX.h)
    assert.ok(b.at > 0 && b.at < size.w)
  })

  it('moves to his left when text sits above him', () => {
    const b = placeBubble(1000, 500, size, [{ x: 900, y: 380, w: 300, h: 40 }], bounds)!
    assert.equal(b.tail, 'right')
    assert.ok(b.x + size.w <= 1000)
  })

  it('stays inside the page and says nothing when there is no clear spot', () => {
    const above = placeBubble(1200, 500, size, [], bounds)!
    assert.ok(above.x + size.w <= 1280)
    assert.equal(placeBubble(100, 500, size, [{ x: 0, y: 0, w: 1280, h: 480 }], bounds), null)
  })
})

describe('pixelScale', () => {
  it('keeps every sprite pixel on whole device pixels', () => {
    for (const dpr of [1, 1.25, 1.5, 1.75, 2, 3]) {
      for (const target of [1, 2]) {
        const devicePixels = pixelScale(target, dpr) * dpr
        assert.ok(Math.abs(devicePixels - Math.round(devicePixels)) < 1e-9, `${target}× at ${dpr}`)
        assert.ok(devicePixels >= 1)
      }
    }
    assert.equal(pixelScale(2, 1), 2)
    assert.equal(pixelScale(1, 2), 1)
  })
})

describe('when the companion runs', () => {
  it('runs only in Pixel with motion allowed, at every width', () => {
    assert.equal(companionEnabled({ pixel: true, reducedMotion: false }), true)
    assert.equal(companionEnabled({ pixel: false, reducedMotion: false }), false, 'Classic')
    assert.equal(companionEnabled({ pixel: true, reducedMotion: true }), false, 'reduced motion')
  })
})

describe('layouts', () => {
  it('splits desktop (sidebar), tablet, and phone', () => {
    assert.equal(layoutFor(1280), 'desktop')
    assert.equal(layoutFor(800), 'tablet')
    assert.equal(layoutFor(375), 'phone')
  })

  it('never places him beside a card on narrow screens', () => {
    assert.ok(modesFor('desktop').includes('beside'))
    assert.ok(!modesFor('tablet').includes('beside'))
    assert.ok(!modesFor('phone').includes('beside'))
  })
})

describe('resolveAnchor', () => {
  const card: Anchor = { id: 'projects', rect: { x: 300, y: 1000, w: 400, h: 300 }, modes: ['top', 'below', 'beside'] }
  const bounds = { x0: 240, x1: 1260 }
  const all = modesFor('desktop')

  it('stands on the top border when there is room, feet exactly on the edge', () => {
    const { placement } = resolveAnchor(card, [], bounds, all)
    assert.equal(placement?.mode, 'top')
    assert.equal(placement?.y, 1000)
    assert.ok(placement!.x >= 300 && placement!.x + SPRITE_BOX.w <= 700)
  })

  it('goes below the card when its top is crowded (a badge or a heading above it)', () => {
    const heading: Rect = { x: 280, y: 930, w: 440, h: 60 }
    const { placement, attempts } = resolveAnchor(card, [heading], bounds, all)
    assert.equal(placement?.mode, 'below')
    assert.equal(placement?.y, 1000 + 300 + 8 + SPRITE_BOX.h)
    assert.deepEqual(attempts.map((a) => [a.mode, a.ok]), [['top', false], ['below', true]])
  })

  it('needs walking room on top, not just a gap his own width', () => {
    const narrow: Anchor = { ...card, rect: { x: 300, y: 1000, w: SPRITE_BOX.w + 4, h: 300 }, modes: ['top'] }
    assert.equal(resolveAnchor(narrow, [], bounds, all).placement, null)
  })

  it('stands beside it, feet level with its bottom, when above and below are taken', () => {
    const blocked: Rect[] = [{ x: 280, y: 900, w: 440, h: 95 }, { x: 280, y: 1302, w: 440, h: 120 }]
    const { placement } = resolveAnchor(card, blocked, bounds, all)
    assert.equal(placement?.mode, 'beside')
    assert.equal(placement?.y, 1300)
    assert.ok(placement!.x >= 700 || placement!.x + SPRITE_BOX.w <= 300)
  })

  it('skips beside on a phone, and skips the anchor when nothing is safe', () => {
    const blocked: Rect[] = [{ x: 280, y: 900, w: 440, h: 95 }, { x: 280, y: 1302, w: 440, h: 120 }]
    const { placement, attempts } = resolveAnchor(card, blocked, bounds, modesFor('phone'))
    assert.equal(placement, null)
    assert.ok(attempts.every((a) => !a.ok))
  })

  it('never leaves the content column', () => {
    const edge: Anchor = { ...card, rect: { x: 1100, y: 1000, w: 160, h: 200 }, modes: ['beside'] }
    const { placement } = resolveAnchor(edge, [], { x0: 240, x1: 1270 }, all)
    assert.ok(!placement || (placement.x >= 240 && placement.x + SPRITE_BOX.w <= 1270))
  })
})
