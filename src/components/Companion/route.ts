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
  /** Only for introducing the section on load: used when its usual stop is below the first screen. */
  early?: boolean
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

/** Walking room a card top needs beyond his own width before he will stand there. */
export const TOP_ROOM = 24
const SIDE_GAP = 12
const BELOW_GAP = 8
/** How far (in sprite widths) "beside" may look along the ground line before the spot no longer reads as beside the card. */
const BESIDE_REACH = 4

/**
 * Where the companion can stand for an anchor: the first of its modes whose
 * sprite box is clear of every obstacle and inside the content bounds.
 * Returns every attempt too, so the placement review can show the fallbacks.
 */
export function resolveAnchor(
  anchor: Anchor,
  obstacles: readonly Rect[],
  bounds: { x0: number; x1: number },
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

  for (const mode of anchor.modes) {
    if (mode === 'top' || mode === 'ledge' || mode === 'below') {
      const y = mode === 'below' ? rect.y + rect.h + BELOW_GAP + box.h : rect.y
      const x0 = Math.max(rect.x, bounds.x0)
      const x1 = Math.min(rect.x + rect.w, bounds.x1)
      const run = clearRun({ y, x0, x1 }, obstacles, box, x1 - x0)
      const room = run ? run[1] - run[0] : -1
      if (run && (mode !== 'top' || room >= TOP_ROOM)) return done(mode, run[1], y, run)
      attempts.push({ mode, box: x1 - x0 >= box.w ? sweep(x1 - box.w, y, x1 - box.w, y, box) : null, ok: false })
    } else {
      // Beside: the nearest clear spot on the card's ground line, right then left, within a few paces.
      const y = rect.y + rect.h
      const reach = BESIDE_REACH * box.w
      const fits = (x: number) => {
        const b = sweep(x, y, x, y, box)
        return inBounds(b) && isClear(b, obstacles)
      }
      for (let d = 0; d <= reach; d += 8) {
        const right = rect.x + rect.w + SIDE_GAP + d
        if (fits(right)) return done(mode, right, y)
        const left = rect.x - SIDE_GAP - box.w - d
        if (fits(left)) return done(mode, left, y)
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
 * on (or below or beside) where his line fits and that is within 60% of a
 * screen below the heading (reached while the section is being introduced);
 * else the heading, if his line fits there; else its first safe card.
 * Contact always uses its first card (the goodbye needs its buttons). An
 * "early" anchor is used only when the section's usual stop is below the
 * first screen (the opening line on a phone, where the hero is tall).
 * `resolved` is every anchor in document order with its placement (or null).
 */
export function pickStops(
  resolved: readonly { anchor: Anchor; placement: Placement | null }[],
  /** Whether his line can be said somewhere along a placement. Prefers the first card where it can. */
  talks: (placement: Placement) => boolean = () => true,
  /** Viewport height: a card more than 60% of it below the heading is reached too late to introduce the section. */
  viewportHeight = Infinity,
): Placement[] {
  const stops: Placement[] = []
  const sections = [...new Set(resolved.map((r) => r.anchor.id))].filter((id) => !NOT_A_STOP.has(id))
  for (const id of sections) {
    const all = resolved.filter((r) => r.anchor.id === id && r.placement)
    const inSection = all.filter((r) => !r.anchor.early)
    const cards = inSection.filter((r) => !r.anchor.modes.every((m) => m === 'ledge'))
    const heading = inSection.find((r) => r.anchor.modes.every((m) => m === 'ledge'))?.placement
    // The goodbye needs the Contact buttons, so there the first card wins even if his line cannot fit.
    if (id === 'contact') {
      const pick = (cards[0] ?? inSection[0])?.placement
      // The goodbye plays wherever the Contact stop is (at its heading too, where there is no room by the buttons).
      if (pick) stops.push({ ...pick, acts: true })
      continue
    }
    // A card where his line fits, near enough to the heading to introduce the section; else the heading
    // if his line fits there; else the first card (he stays quiet).
    const near = (p: Placement) => !heading || p.y - heading.y <= 0.6 * viewportHeight
    const pick =
      cards.find((r) => talks(r.placement!) && near(r.placement!))?.placement ??
      (heading && talks(heading) ? heading : undefined) ??
      cards[0]?.placement ??
      heading
    // The opening section is introduced on load: below the first screen, use its early spot if it has one.
    const early = pick && pick.y > viewportHeight ? all.find((r) => r.anchor.early && r.placement!.y <= viewportHeight) : undefined
    const chosen = early?.placement ?? pick
    if (chosen) stops.push(chosen)
  }
  return stops.sort((a, b) => a.y - b.y)
}

/** How far he walks on each card after arriving: a step or two, then he stops. */
export const BRIEF_WALK = 64

/**
 * His tour: he appears on each section's stop (the first one on load, the
 * rest by teleport once that section is well into view), walks briefly
 * along the card top (alternating direction from section to section), and
 * stops there until the reader scrolls to the next section. Where his
 * line would have no clear bubble spot, he walks on to the nearest spot
 * along the card where it does.
 */
export function tour(
  stops: readonly Placement[],
  viewportHeight: number,
  /** Whether his line for that stop has a clear bubble spot with him standing at x. */
  canTalk: (stop: Placement, x: number) => boolean = () => true,
): RoutePoint[] {
  const points: RoutePoint[] = []
  stops.forEach((stop, i) => {
    const shared = { y: stop.y, dark: stop.dark, ledge: stop.id, mode: stop.mode, acts: stop.acts }
    const [left, right] = stop.run
    const leftward = i % 2 === 0
    const from = leftward ? right : left
    const planned = leftward ? Math.max(left, from - BRIEF_WALK) : Math.min(right, from + BRIEF_WALK)
    // He stops where his line has room: the planned spot, or the nearest spot along the card that has it.
    const spots: number[] = []
    for (let x = left; x <= right; x += 8) spots.push(x)
    spots.push(right)
    spots.sort((a, b) => Math.abs(a - planned) - Math.abs(b - planned))
    const to = canTalk(stop, planned) ? planned : (spots.find((x) => canTalk(stop, x)) ?? planned)
    // The first stop is where he appears on load (his short walk plays straight away); later ones arrive by teleport.
    const key = Math.max(points.at(-1)?.key ?? -Infinity, i === 0 ? 0 : stop.y - 0.15 * viewportHeight)
    points.push({ x: from, key, blink: i > 0, ...shared })
    // Same key: the short walk plays out in time as soon as he arrives, not with the scroll.
    if (to !== from) points.push({ x: to, key, blink: false, ...shared })
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
  tail: 'down' | 'right' | 'left' | 'none'
  /** Tail position along that side, in px from the bubble's left (down) or top (right, left). */
  at: number
}

const GAP = 10 // room for the tail between the bubble and the sprite

/**
 * Where a speech bubble of `size` can go for a companion standing at
 * (x, y), best first: above his head extending left, above extending right,
 * beside him on the left, beside him on the right. Null when none is clear
 * of the obstacles and inside the bounds, so it never covers page content.
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
  const clamp = (bx: number) => Math.max(bounds.x0, Math.min(bx, bounds.x1 - size.w))
  const aboveY = y - box.h - GAP - size.h
  const sideY = y - box.h
  const sideAt = Math.min(size.h / 2, box.h / 3)
  const candidates: Bubble[] = [
    { x: clamp(x + box.w - size.w), y: aboveY, tail: 'down', at: 0 },
    { x: clamp(x), y: aboveY, tail: 'down', at: 0 },
    { x: x - GAP - size.w, y: sideY, tail: 'right', at: sideAt },
    { x: x + box.w + GAP, y: sideY, tail: 'left', at: sideAt },
  ]
  for (const c of candidates) {
    if (!fits({ x: c.x, y: c.y, w: size.w, h: size.h })) continue
    return c.tail === 'down' ? { ...c, at: x + box.w / 2 - c.x } : c
  }
  return null
}

/** How far the fallback bubble may sit from him and still point at him with its tail. */
const NOTE_REACH = 3 * GAP

/**
 * Where his line goes when no spot beside him is clear: the clear spot
 * nearest his head inside `area` (the part of the page in view), above his
 * head if anywhere there is clear, never over him. Its tail points at him when it sits just above or beside him;
 * otherwise it has none. Null when nothing in the area is clear.
 */
export function placeNote(x: number, y: number, size: Box, obstacles: readonly Rect[], area: Rect, box = SPRITE_BOX): Bubble | null {
  const him = { x: x - GAP, y: y - box.h - GAP, w: box.w + 2 * GAP, h: box.h + 2 * GAP }
  const blocked = [...obstacles.filter((o) => overlaps(o, area)), him]
  const head = { x: x + box.w / 2, y: y - box.h + box.h / 3 }
  const spots: { x: number; y: number; d: number }[] = []
  for (let by = area.y; by + size.h <= area.y + area.h; by += 8) {
    for (let bx = area.x; bx + size.w <= area.x + area.w; bx += 8) {
      const dx = Math.max(bx - head.x, 0, head.x - bx - size.w)
      const dy = Math.max(by - head.y, 0, head.y - by - size.h)
      // A speech bubble reads as his when it is above his head: any spot there beats one below him.
      const below = by + size.h > y - box.h
      spots.push({ x: bx, y: by, d: dx * dx + dy * dy + (below ? 1e12 : 0) })
    }
  }
  spots.sort((a, b) => a.d - b.d)
  const spot = spots.find((s) => isClear({ x: s.x, y: s.y, w: size.w, h: size.h }, blocked))
  if (!spot) return null
  const { x: bx, y: by } = spot
  const sideAt = Math.min(Math.max(head.y - by, 8), size.h - 8)
  if (bx + size.w <= x && x - bx - size.w <= NOTE_REACH) return { x: bx, y: by, tail: 'right', at: sideAt }
  if (bx >= x + box.w && bx - x - box.w <= NOTE_REACH) return { x: bx, y: by, tail: 'left', at: sideAt }
  if (by + size.h <= y - box.h && y - box.h - by - size.h <= NOTE_REACH) {
    return { x: bx, y: by, tail: 'down', at: Math.min(Math.max(head.x - bx, 8), size.w - 8) }
  }
  return { x: bx, y: by, tail: 'none', at: 0 }
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

/** The first point of the stop that point i belongs to: arrivals begin there and take the short walk. */
export function stopStart(points: readonly RoutePoint[], i: number): number {
  while (i > 0 && !points[i].blink && points[i - 1].ledge === points[i].ledge) i -= 1
  return i
}

export type Move = { kind: 'still' } | { kind: 'walk'; to: number } | { kind: 'teleport'; to: number }

/**
 * What he should do now, from the latest scroll position only: stay, finish
 * his short walk on the current stop, or teleport straight to the stop the
 * reader has reached (however many sections a fast scroll skipped, in either
 * direction). Nothing depends on earlier animations having finished.
 */
export function nextMove(points: readonly RoutePoint[], p: number, line: number): Move {
  if (!points.length) return { kind: 'still' }
  const to = targetAt(points, line)
  const there = stopStart(points, to)
  // A re-measured route can be shorter than the one his position came from.
  if (stopStart(points, Math.min(Math.floor(p), points.length - 1)) !== there) return { kind: 'teleport', to: there }
  return Math.abs(to - p) < 1e-6 ? { kind: 'still' } : { kind: 'walk', to }
}

/**
 * CSS px per sprite pixel in the brand slot: the largest whole number of
 * device pixels per sprite pixel that keeps him no taller than `limit` (the
 * height of the name beside him). Null when even one device pixel per sprite
 * pixel is too tall; then the "CB" mark stays.
 */
export function brandScale(limit: number, devicePixelRatio: number, spriteHeight = 32): number | null {
  const devicePixels = Math.floor((limit * devicePixelRatio) / spriteHeight)
  return devicePixels >= 1 ? devicePixels / devicePixelRatio : null
}

/** The companion runs in the Pixel design only. With reduced motion he is a still figure (see engine.ts). */
export const companionEnabled = (o: { pixel: boolean }) => o.pixel
