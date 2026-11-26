import {
  layoutFor,
  pickStops,
  placeBubble,
  resolveAnchor,
  tour,
  type Anchor,
  type Attempt,
  type Box,
  type Mode,
  type Placement,
  type Rect,
  type RoutePoint,
} from './route'

/**
 * Page measuring for the companion (DOM only; the decisions live in
 * route.ts). Anchors are elements marked `data-companion-anchor="<section>"`
 * with `data-companion-place="top below …"` listing the positions they
 * allow, best first.
 */

/** Links and controls get room for their focus ring (3 px outline, 2 px offset) plus a margin. */
const PAD = { text: 6, control: 12, media: 2 }
const CONTROLS = 'a, button, input, select, textarea, summary, label, [tabindex], [role="tab"]'
const MEDIA = 'img, svg, video, canvas, iframe'

const toDocument = (r: DOMRect, pad: number): Rect => ({
  x: r.left + window.scrollX - pad,
  y: r.top + window.scrollY - pad,
  w: r.width + 2 * pad,
  h: r.height + 2 * pad,
})

/** Each line of text on the page. */
function measureText(): Rect[] {
  const out: Rect[] = []
  const range = document.createRange()
  for (const scope of document.querySelectorAll('main, footer')) {
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => (node.nodeValue?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
    })
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      range.selectNodeContents(node)
      for (const r of range.getClientRects()) if (r.width && r.height) out.push(toDocument(r, PAD.text))
    }
  }
  return out
}

/**
 * Every link and control (with room for its focus ring) and every image or
 * screenshot. `withAnchors: false` leaves out the ones he may stand on (the
 * Skills panel, the Contact buttons): they are not obstacles to their own
 * placement, and their focus ring is handled live instead (he steps out of
 * view while focus would touch him).
 */
function measureControls(withAnchors: boolean): Rect[] {
  const out: Rect[] = []
  for (const el of document.querySelectorAll(`main :is(${CONTROLS}, ${MEDIA}), footer :is(${CONTROLS}, ${MEDIA})`)) {
    if (!withAnchors && el.matches('[data-companion-anchor]')) continue
    const r = el.getBoundingClientRect()
    if (r.width && r.height) out.push(toDocument(r, el.matches(MEDIA) ? PAD.media : PAD.control))
  }
  return out
}

/** The content column he must stay inside (no horizontal overflow, never over the sidebar). */
export function contentBounds() {
  const main = document.querySelector('main')?.getBoundingClientRect()
  const right = Math.min(main?.right ?? window.innerWidth, document.documentElement.clientWidth)
  return { x0: (main?.left ?? 0) + window.scrollX, x1: right + window.scrollX }
}

export function measureAnchors(): Anchor[] {
  const panels = [...document.querySelectorAll<HTMLElement>('main > section, footer')].map((el) => ({
    rect: toDocument(el.getBoundingClientRect(), 0),
    dark: el.dataset.tone === 'ink' || el.tagName === 'FOOTER',
  }))
  return [...document.querySelectorAll<HTMLElement>('[data-companion-anchor]')]
    .filter((el) => el.getClientRects().length > 0)
    .map((el) => {
      const rect = toDocument(el.getBoundingClientRect(), 0)
      // Dark when the sprite would stand over a dark panel (he stands just above the anchor's top).
      const probe = rect.y - 32
      const behind = panels.find((p) => probe >= p.rect.y && probe < p.rect.y + p.rect.h)
      return {
        id: el.dataset.companionAnchor ?? '',
        rect,
        modes: (el.dataset.companionPlace ?? 'top').split(/\s+/) as Mode[],
        dark: Boolean(behind?.dark),
        acts: el.hasAttribute('data-companion-act'),
        early: el.hasAttribute('data-companion-early'),
      }
    })
}

export interface PlacementPlan {
  layout: ReturnType<typeof layoutFor>
  /** What he must never stand in front of: text, links and controls, images. */
  obstacles: Rect[]
  /** What his speech bubble avoids: the same, plus the controls he may stand on or beside. */
  bubbleObstacles: Rect[]
  /** What his bubble never covers, even briefly: links, controls, and images (text it may cover for a moment). */
  controls: Rect[]
  bounds: { x0: number; x1: number }
  anchors: { anchor: Anchor; placement: Placement | null; attempts: Attempt[] }[]
}

/** Measure the page and resolve every anchor for the current layout. */
export function planPlacements(box: Box): PlacementPlan {
  const layout = layoutFor(window.innerWidth, parseFloat(getComputedStyle(document.documentElement).fontSize) || 16)
  const text = measureText()
  const controls = measureControls(true)
  const obstacles = [...text, ...measureControls(false)]
  const bounds = contentBounds()
  const measured = measureAnchors()
  // He may stand on a card or in whitespace, never in front of another card.
  const cards = measured.filter((a) => !a.modes.every((m) => m === 'ledge'))
  const anchors = measured.map((anchor) => {
    const others = cards.filter((c) => c !== anchor).map((c) => c.rect)
    return { anchor, ...resolveAnchor(anchor, [...obstacles, ...others], bounds, box) }
  })
  return { layout, obstacles, bubbleObstacles: [...text, ...controls], controls, bounds, anchors }
}

/** Each line measured in an off-screen copy of the bubble (wrapping and font as it will render). */
export function measureLines(bubble: HTMLElement, lines: Record<string, string>): Record<string, Box> {
  const probe = bubble.cloneNode() as HTMLElement
  Object.assign(probe.style, { visibility: 'hidden', transform: 'none' })
  probe.hidden = false
  document.body.append(probe)
  const sizes: Record<string, Box> = {}
  for (const [id, text] of Object.entries(lines)) {
    probe.textContent = text
    const { width, height } = probe.getBoundingClientRect()
    sizes[id] = { w: width, h: height }
  }
  probe.remove()
  return sizes
}

/**
 * His route for the current layout: one stop per section, each ending where
 * his line (of the measured `lineSizes`) has a clear bubble spot beside him.
 * `still` (reduced motion): one still figure at the last section.
 */
export function planRoute(box: Box, lineSizes: Record<string, Box>, still: boolean): PlacementPlan & { points: RoutePoint[] } {
  const plan = planPlacements(box)
  const canTalk = (stop: Placement, x: number) =>
    !lineSizes[stop.id] || placeBubble(x, stop.y, lineSizes[stop.id], plan.bubbleObstacles, plan.bounds, box) !== null
  const talksSomewhere = (stop: Placement) => {
    for (let x = stop.run[0]; x <= stop.run[1]; x += 8) if (canTalk(stop, x)) return true
    return canTalk(stop, stop.run[1])
  }
  const stops = pickStops(plan.anchors, talksSomewhere, window.innerHeight)
  const points = still ? tour(stops.slice(-1), window.innerHeight).slice(0, 1) : tour(stops, window.innerHeight, canTalk)
  return { ...plan, points }
}
