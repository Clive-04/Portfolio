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

/** A surface the companion may stand on: its top edge from x0 to x1. */
export interface Ledge {
  y: number
  x0: number
  x1: number
  /** The sprite would stand over a dark panel, so it needs its light rim even in Day. */
  dark?: boolean
  /** The ledge's name (its `data-companion-ledge` value), used to pick what the companion says there. */
  id?: string
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

/**
 * Joins the ledges (top to bottom) into one path. On each ledge the companion
 * stands at the clear spot nearest to where it came from. Between ledges it
 * walks straight down and across when that path is clear, and otherwise
 * takes a short teleport, so it never crosses page content.
 */
export function buildRoute(
  ledges: readonly Ledge[],
  obstacles: readonly Rect[],
  viewportHeight: number,
  box = SPRITE_BOX,
): RoutePoint[] {
  const points: RoutePoint[] = []
  const sorted = [...ledges].sort((a, b) => a.y - b.y)

  for (const ledge of sorted) {
    if (ledge.y < box.h) continue // no room above the top of the page
    const run = clearRun(ledge, obstacles, box)
    if (!run) continue
    const prev = points.at(-1)
    if (prev && ledge.y - prev.y < box.h) continue // too close to the last ledge to read as a step

    const shared = { dark: Boolean(ledge.dark), ledge: ledge.id }
    const [left, right] = run
    // Stand at the clear spot nearest where he already is, so the path runs straight down rather than zig-zagging.
    const enter = prev ? Math.min(right, Math.max(left, prev.x)) : right

    if (!prev) {
      points.push({ x: enter, y: ledge.y, key: ledge.y, blink: false, ...shared })
    } else if (
      isClear(sweep(prev.x, prev.y, prev.x, ledge.y, box), obstacles) &&
      isClear(sweep(prev.x, ledge.y, enter, ledge.y, box), obstacles)
    ) {
      if (prev.x !== enter) points.push({ x: prev.x, y: ledge.y, key: ledge.y, blink: false, ...shared })
      points.push({ x: enter, y: ledge.y, key: ledge.y, blink: false, ...shared })
    } else {
      // Stay on the last ledge as it scrolls away; arrive once the next one is well into view.
      const key = Math.max(prev.key, ledge.y - 0.15 * viewportHeight)
      points.push({ x: enter, y: ledge.y, key, blink: true, ...shared })
    }
  }
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

/** The companion runs only in the Pixel design, beside the fixed sidebar, with motion allowed. */
export const companionEnabled = (o: { pixel: boolean; wide: boolean; reducedMotion: boolean }) =>
  o.pixel && o.wide && !o.reducedMotion
