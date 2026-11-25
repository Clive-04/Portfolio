import { layoutFor, modesFor, resolveAnchor, type Anchor, type Attempt, type Box, type Mode, type Placement, type Rect } from './route'

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

/** Everything the companion must never cover: each line of text, every link and control, and every image or screenshot. */
export function measureObstacles(): Rect[] {
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
    for (const el of scope.querySelectorAll(`${CONTROLS}, ${MEDIA}`)) {
      const r = el.getBoundingClientRect()
      if (r.width && r.height) out.push(toDocument(r, el.matches(MEDIA) ? PAD.media : PAD.control))
    }
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
      }
    })
}

export interface PlacementPlan {
  layout: ReturnType<typeof layoutFor>
  obstacles: Rect[]
  bounds: { x0: number; x1: number }
  anchors: { anchor: Anchor; placement: Placement | null; attempts: Attempt[] }[]
}

/** Measure the page and resolve every anchor for the current layout. */
export function planPlacements(box: Box): PlacementPlan {
  const layout = layoutFor(window.innerWidth, parseFloat(getComputedStyle(document.documentElement).fontSize) || 16)
  const obstacles = measureObstacles()
  const bounds = contentBounds()
  const allowed = modesFor(layout)
  const measured = measureAnchors()
  // He may stand on a card or in whitespace, never in front of another card.
  const cards = measured.filter((a) => !a.modes.every((m) => m === 'ledge'))
  const anchors = measured.map((anchor) => {
    const others = cards.filter((c) => c !== anchor).map((c) => c.rect)
    return { anchor, ...resolveAnchor(anchor, [...obstacles, ...others], bounds, allowed, box) }
  })
  return { layout, obstacles, bounds, anchors }
}
