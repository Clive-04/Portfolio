/**
 * Pure route logic for the scrolling companion (no DOM), so it can be tested
 * with Node's runner. Coordinates are document CSS pixels; a sprite box is
 * placed by its left edge `x` and the line its feet stand on, `y`.
 */

export const SPRITE_BOX: Box = { w: 48, h: 64 } // 24 × 32 sprite at 2×

export interface Box {
  w: number
  h: number
}

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

/** A surface the companion may stand on: its feet line y, from x0 to x1. */
export interface Ledge {
  y: number
  x0: number
  x1: number
}

/**
 * How the companion relates to an anchor (a card or block):
 * top — standing on its top border; ledge — on a decorative edge (a band
 * or section boundary); below — in the whitespace under it; beside — in
 * the whitespace next to it, feet level with its bottom edge.
 */
export type Mode = 'top' | 'ledge' | 'below' | 'beside'

/** A measured card or block, the positions it allows (in order of preference), and its section. */
export interface Anchor {
  id: string
  rect: Rect
  modes: Mode[]
  dark?: boolean
  acts?: boolean
}

export interface Attempt {
  mode: Mode
  /** The sprite box that was tried, or null when the mode had no room at all. */
  box: Rect | null
  ok: boolean
}

export interface Placement {
  id: string
  mode: Mode
  x: number
  /** Feet line. */
  y: number
  /** The clear stretch he can walk along on that surface (left and right sprite positions). */
  run: [number, number]
  dark: boolean
  acts: boolean
}

export type Layout = 'desktop' | 'tablet' | 'phone'

/** Desktop has the fixed sidebar (56rem and up); tablets and phones get the top bar and a single column. */
export const layoutFor = (width: number, remPx = 16): Layout =>
  width >= 56 * remPx ? 'desktop' : width >= 40 * remPx ? 'tablet' : 'phone'

/** On narrow screens he stands above or below cards, never beside them. */
export const modesFor = (layout: Layout): Mode[] =>
  layout === 'desktop' ? ['top', 'ledge', 'below', 'beside'] : ['top', 'ledge', 'below']

/** Walking room a card top needs beyond his own width before he will stand there. */
export const TOP_ROOM = 24
const SIDE_GAP = 12
const BELOW_GAP = 8

/**
 * Where the companion can stand for an anchor: the first allowed mode whose
 * sprite box is clear of every obstacle and inside the content bounds.
 * Returns every attempt too, so the placement review can show the fallbacks.
 */
export function resolveAnchor(
  anchor: Anchor,
  obstacles: readonly Rect[],
  bounds: { x0: number; x1: number },
  allowed: readonly Mode[],
  box = SPRITE_BOX,
): { placement: Placement | null; attempts: Attempt[] } {
  const attempts: Attempt[] = []
  const { rect } = anchor
  const inBounds = (b: Rect) => b.x >= bounds.x0 && b.x + b.w <= bounds.x1
  const done = (mode: Mode, x: number, y: number, run: [number, number] = [x, x]) => {
    attempts.push({ mode, box: sweep(run[0], y, run[1], y, box), ok: true })
    const placement = { id: anchor.id, mode, x, y, run, dark: Boolean(anchor.dark), acts: Boolean(anchor.acts) }
    return { placement, attempts }
  }

  for (const mode of anchor.modes.filter((m) => allowed.includes(m))) {
    if (mode === 'top' || mode === 'ledge' || mode === 'below') {
      const y = mode === 'below' ? rect.y + rect.h + BELOW_GAP + box.h : rect.y
      const x0 = Math.max(rect.x, bounds.x0)
      const x1 = Math.min(rect.x + rect.w, bounds.x1)
      const run = clearRun({ y, x0, x1 }, obstacles, box, x1 - x0)
      const room = run ? run[1] - run[0] : -1
      if (run && (mode !== 'top' || room >= TOP_ROOM)) return done(mode, run[1], y, run)
      attempts.push({ mode, box: x1 - x0 >= box.w ? sweep(x1 - box.w, y, x1 - box.w, y, box) : null, ok: false })
    } else {
      const y = rect.y + rect.h
      for (const x of [rect.x + rect.w + SIDE_GAP, rect.x - SIDE_GAP - box.w]) {
        const b = sweep(x, y, x, y, box)
        if (inBounds(b) && isClear(b, obstacles)) return done(mode, x, y)
      }
      attempts.push({ mode, box: null, ok: false })
    }
  }
  return { placement: null, attempts }
}

export interface RoutePoint {
  x: number
  y: number
  /** Viewport-line position at which the companion should have reached this point. */
  key: number
  /** Reached by a short teleport from the previous point instead of walking. */
  blink: boolean
  dark: boolean
  ledge?: string
  mode?: Mode
  acts?: boolean
}

/** Boxes that only touch, or meet within half a pixel of rounding, do not overlap. */
const EDGE = 0.5
const overlaps = (a: Rect, b: Rect) =>
  a.x < b.x + b.w - EDGE && b.x < a.x + a.w - EDGE && a.y < b.y + b.h - EDGE && b.y < a.y + a.h - EDGE

/** True when the box touches none of the obstacles. */
export const isClear = (box: Rect, obstacles: readonly Rect[]) => !obstacles.some((o) => overlaps(box, o))

/** The box the sprite fills, or sweeps through, between two feet positions. */
export function sweep(ax: number, ay: number, bx: number, by: number, box = SPRITE_BOX): Rect {
  const x = Math.min(ax, bx)
  const top = Math.min(ay, by) - box.h
  return { x, y: top, w: Math.abs(bx - ax) + box.w, h: Math.max(ay, by) - top }
}

/**
 * The clear stretch of a ledge nearest its right end: where the sprite can
 * stand and stroll without touching an obstacle. Null when none is clear.
 */
export function clearRun(
  ledge: Ledge,
  obstacles: readonly Rect[],
  box = SPRITE_BOX,
  maxLength = 160,
  step = 8,
): [number, number] | null {
  const standAt = (x: number) => isClear(sweep(x, ledge.y, x, ledge.y, box), obstacles)
  let right = ledge.x1 - box.w
  while (right >= ledge.x0 && !standAt(right)) right -= step
  if (right < ledge.x0) return null
  let left = right
  while (left - step >= ledge.x0 && right - (left - step) <= maxLength && standAt(left - step)) left -= step
  return [left, right]
}

/** Sections that are not stops on his tour (he docks in the brand slot before the footer). */
const NOT_A_STOP = new Set(['footer'])

/**
 * One stop per section, in page order: the section's first card he can stand
 * on (or below or beside); if none of its cards is safe, its heading ledge.
 * `resolved` is every anchor in document order with its placement (or null).
 */
export function pickStops(resolved: readonly { anchor: Anchor; placement: Placement | null }[]): Placement[] {
  const stops: Placement[] = []
  const sections = [...new Set(resolved.map((r) => r.anchor.id))].filter((id) => !NOT_A_STOP.has(id))
  for (const id of sections) {
    const inSection = resolved.filter((r) => r.anchor.id === id && r.placement)
    const card = inSection.find((r) => !r.anchor.modes.every((m) => m === 'ledge'))
    const pick = (card ?? inSection[0])?.placement
    if (pick) stops.push(pick)
  }
  return stops.sort((a, b) => a.y - b.y)
}

/**
 * His tour: on each stop he walks the clear length of the card top as the
 * reader scrolls through that section (alternating direction from section
 * to section), then teleports onto the next section's stop once it is well
 * into view. The first stop is where he appears on load.
 */
export function tour(stops: readonly Placement[], viewportHeight: number): RoutePoint[] {
  const points: RoutePoint[] = []
  const arrive = stops.map((s, i) => (i === 0 ? s.y : s.y - 0.15 * viewportHeight))
  stops.forEach((stop, i) => {
    const shared = { y: stop.y, dark: stop.dark, ledge: stop.id, mode: stop.mode, acts: stop.acts }
    const [left, right] = stop.run
    const [from, to] = i % 2 ? [left, right] : [right, left]
    const key = Math.max(points.at(-1)?.key ?? -Infinity, arrive[i])
    points.push({ x: from, key, blink: i > 0, ...shared })
    if (to !== from) {
      // Walk the card as the reader scrolls, finishing a little before the next section's arrival.
      const room = i + 1 < stops.length ? arrive[i + 1] - key - 40 : Infinity
      points.push({ x: to, key: key + Math.max(0, Math.min(Math.abs(to - from), room)), blink: false, ...shared })
    }
  })
  return points
}

/**
 * Where the companion should be for a given viewport line (scroll position
 * plus a fixed share of the viewport height), as a fractional point index.
 * Walking down tracks the line; a stroll or teleport happens once the line
 * passes its key.
 */
export function targetAt(points: readonly RoutePoint[], line: number): number {
  if (!points.length) return 0
  let i = -1
  while (i + 1 < points.length && points[i + 1].key <= line) i += 1
  if (i < 0) return 0
  const next = points[i + 1]
  if (!next || next.blink || next.key === points[i].key) return i
  return i + (line - points[i].key) / (next.key - points[i].key)
}

/** Feet position at a fractional point index. */
export function positionAt(points: readonly RoutePoint[], p: number) {
  const i = Math.min(Math.floor(p), points.length - 1)
  const a = points[i]
  const b = points[i + 1]
  if (!b || p === i) return { x: a.x, y: a.y, dark: a.dark }
  const t = p - i
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, dark: t < 0.5 ? a.dark : b.dark }
}

export interface Step {
  p: number
  /** Distance actually walked this step, in CSS px. */
  walked: number
  dx: number
  dy: number
  /** Stopped at a teleport: the caller plays it and jumps to `blinkTo`. */
  blinkTo: number | null
}

/**
 * Walk from `from` toward `to` along the route by at most `budget` pixels.
 * Stops at a teleport segment instead of walking through it.
 */
export function advance(points: readonly RoutePoint[], from: number, to: number, budget: number): Step {
  let p = from
  let walked = 0
  let dx = 0
  let dy = 0
  const forward = to > from
  while (budget > 1e-9 && (forward ? p < to : p > to)) {
    const i = forward ? Math.floor(p + 1e-9) : Math.ceil(p - 1e-9) - 1
    const a = points[i]
    const b = points[i + 1]
    if (!a || !b) break
    const atStart = forward ? Math.abs(p - i) < 1e-9 : Math.abs(p - (i + 1)) < 1e-9
    if (b.blink && atStart) return { p, walked, dx, dy, blinkTo: forward ? i + 1 : i }
    const length = Math.hypot(b.x - a.x, b.y - a.y)
    const end = forward ? Math.min(i + 1, to) : Math.max(i, to)
    if (length === 0) {
      p = end
      continue
    }
    const move = Math.min(budget, Math.abs(end - p) * length)
    p += ((forward ? 1 : -1) * move) / length
    if (Math.abs(p - Math.round(p)) < 1e-9) p = Math.round(p)
    budget -= move
    walked += move
    dx = (b.x - a.x) * (forward ? 1 : -1)
    dy = (b.y - a.y) * (forward ? 1 : -1)
  }
  return { p, walked, dx, dy, blinkTo: null }
}

/** Walking distance between two positions, or Infinity when a teleport lies between them. */
export function walkingDistance(points: readonly RoutePoint[], from: number, to: number): number {
  const [lo, hi] = from < to ? [from, to] : [to, from]
  let total = 0
  for (let i = Math.floor(lo); i < Math.ceil(hi); i += 1) {
    const a = points[i]
    const b = points[i + 1]
    if (!a || !b) break
    if (b.blink) return Infinity
    const share = Math.min(hi, i + 1) - Math.max(lo, i)
    total += Math.hypot(b.x - a.x, b.y - a.y) * share
  }
  return total
}

export type WalkClip = 'walkDown' | 'walkUp' | 'walkRight' | 'walkLeft'

/** Which walk to show for a movement direction. */
export function walkClip(dx: number, dy: number): WalkClip {
  if (Math.abs(dy) >= Math.abs(dx)) return dy >= 0 ? 'walkDown' : 'walkUp'
  return dx > 0 ? 'walkRight' : 'walkLeft'
}

/**
 * Walk frame for the distance walked so far: one frame per 4 sprite pixels
 * (8 CSS px at 2×), so a four-frame cycle covers 16 sprite pixels and the
 * feet never slide.
 */
export const walkFrame = (distance: number, pxPerFrame = 8) => Math.floor(distance / pxPerFrame) % 4

/**
 * Whether the companion belongs in the sidebar slot. It docks at the very
 * bottom of the page and then stays there until the page is reloaded.
 */
export function docked(wasDocked: boolean, scrollY: number, maxScroll: number): boolean {
  if (wasDocked) return true
  return maxScroll > 0 && scrollY >= maxScroll - 2
}

export interface Bubble {
  x: number
  y: number
  /** Which side of the bubble its tail is on, pointing at the companion. */
  tail: 'down' | 'right'
  /** Tail position along that side, in px from the bubble's left (down) or top (right). */
  at: number
}

const GAP = 10 // room for the tail between the bubble and the sprite

/**
 * Where a speech bubble of `size` can go for a companion standing at
 * (x, y): above his head (preferred), else to his left. Null when neither
 * spot is clear of the obstacles and inside the bounds, so it never covers
 * page content.
 */
export function placeBubble(
  x: number,
  y: number,
  size: Box,
  obstacles: readonly Rect[],
  bounds: { x0: number; x1: number },
  box = SPRITE_BOX,
): Bubble | null {
  const fits = (b: Rect) => b.x >= bounds.x0 && b.x + b.w <= bounds.x1 && b.y >= 0 && isClear(b, obstacles)

  const aboveX = Math.max(bounds.x0, Math.min(x + box.w - size.w, bounds.x1 - size.w))
  const above = { x: aboveX, y: y - box.h - GAP - size.h, w: size.w, h: size.h }
  if (fits(above)) return { x: above.x, y: above.y, tail: 'down', at: x + box.w / 2 - above.x }

  const left = { x: x - GAP - size.w, y: y - box.h, w: size.w, h: size.h }
  if (fits(left)) return { x: left.x, y: left.y, tail: 'right', at: Math.min(size.h / 2, box.h / 3) }
  return null
}

/**
 * CSS pixels per sprite pixel, so each sprite pixel covers a whole number of
 * device pixels: 2 at 100% and 200% scaling, 2.4 at 125% (3 device px), 2 at
 * 150% (3 device px). Uneven pixels would look blurred or lumpy.
 */
export const pixelScale = (target: number, devicePixelRatio: number) =>
  Math.max(1, Math.round(target * devicePixelRatio)) / devicePixelRatio

/** Round a CSS length to the device-pixel grid. */
export const snap = (value: number, devicePixelRatio: number) => Math.round(value * devicePixelRatio) / devicePixelRatio

/** The companion runs only in the Pixel design with motion allowed (every width; the route adapts to the layout). */
export const companionEnabled = (o: { pixel: boolean; reducedMotion: boolean }) => o.pixel && !o.reducedMotion
