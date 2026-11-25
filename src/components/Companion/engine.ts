import sheetUrl from './companion-sprites.png'
import sheet from './companion-sprites.json'
import {
  advance,
  buildRoute,
  docked,
  pixelScale,
  positionAt,
  snap,
  targetAt,
  walkClip,
  walkFrame,
  type Box,
  type Ledge,
  type Rect,
  type RoutePoint,
} from './route'

type Clip = keyof typeof sheet.clips
type Frame = [clip: Clip, index: number, ms: number]

/** The companion aims for the route point level with this share of the viewport height. */
const LINE = 0.75
const INTERACTIVE = 'a, button, input, select, textarea, summary, label, [tabindex], [role="tab"], img, svg, video, canvas, iframe'

const frames = (clip: Clip): Frame[] => sheet.clips[clip].ms.map((ms, i) => [clip, i, ms])

/** Size an element to one sprite cell at a scale and give it the sheet. */
function dress(el: HTMLElement, scale: number) {
  Object.assign(el.style, {
    width: `${sheet.frameWidth * scale}px`,
    height: `${sheet.frameHeight * scale}px`,
    backgroundImage: `url("${sheetUrl}")`,
    backgroundSize: `${sheet.width * scale}px ${sheet.height * scale}px`,
  })
  el.style.setProperty('--rim-step', `${scale}px`)
}

function show(el: HTMLElement, [clip, index]: Frame | [Clip, number], scale: number) {
  el.style.backgroundPosition = `${-index * sheet.frameWidth * scale}px ${-sheet.clips[clip].row * sheet.frameHeight * scale}px`
}

const toDocument = (r: DOMRect, padX: number, padY = padX): Rect => ({
  x: r.left + window.scrollX - padX,
  y: r.top + window.scrollY - padY,
  w: r.width + 2 * padX,
  h: r.height + 2 * padY,
})

/** Named surfaces the companion may stand on (`data-companion-ledge`), by their top edges. */
function measureLedges(): Ledge[] {
  const main = document.querySelector('main')
  if (!main) return []
  const right = main.getBoundingClientRect().right + window.scrollX
  const panels = [...document.querySelectorAll<HTMLElement>('main > section, footer')].map((el) => ({
    rect: toDocument(el.getBoundingClientRect(), 0),
    dark: el.dataset.tone === 'ink' || el.tagName === 'FOOTER',
  }))
  return [...document.querySelectorAll<HTMLElement>('[data-companion-ledge]')].map((el) => {
    const r = toDocument(el.getBoundingClientRect(), 0)
    // The sprite stands just above the edge, over whichever panel is there.
    const behind = panels.find((p) => r.y - 32 >= p.rect.y && r.y - 32 < p.rect.y + p.rect.h)
    return { y: r.y, x0: r.x, x1: Math.min(r.x + r.w, right), dark: Boolean(behind?.dark) }
  })
}

/** Everything the companion must never cover: each line of text, and every link, control, and image (with room for focus rings). */
function measureObstacles(): Rect[] {
  const out: Rect[] = []
  const range = document.createRange()
  for (const scope of document.querySelectorAll('main, footer')) {
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => (node.nodeValue?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
    })
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      range.selectNodeContents(node)
      for (const r of range.getClientRects()) if (r.width && r.height) out.push(toDocument(r, 6))
    }
    for (const el of scope.querySelectorAll(INTERACTIVE)) {
      const r = el.getBoundingClientRect()
      if (r.width && r.height) out.push(toDocument(r, el.matches('img, svg, video, canvas') ? 2 : 8))
    }
  }
  return out
}

/**
 * Runs the companion: measures its route, follows the scroll, and docks in
 * the sidebar slot at the bottom of the page. Returns a cleanup function that
 * removes every listener and timer and restores the "CB" mark.
 */
export function startCompanion(sprite: HTMLElement, slot: HTMLElement | null): () => void {
  const root = document.documentElement
  let stopped = false
  let points: RoutePoint[] = []
  let p = 0
  let walked = 0
  let isDocked = false
  let busy = false
  let raf = 0
  let lastTime = 0
  let idleRun = 0
  let idling = false
  let scale = 2
  let box: Box = { w: 48, h: 64 }
  let dpr = 1
  const timers = new Set<number>()

  const wait = (ms: number) =>
    new Promise<void>((resolve) => {
      const id = window.setTimeout(() => {
        timers.delete(id)
        resolve()
      }, ms)
      timers.add(id)
    })

  async function play(el: HTMLElement, list: Frame[], s: number) {
    for (const frame of list) {
      if (stopped) return
      show(el, frame, s)
      await wait(frame[2])
    }
  }

  const line = () => window.scrollY + LINE * window.innerHeight

  function place() {
    const { x, y, dark } = positionAt(points, p)
    sprite.style.transform = `translate(${snap(x, dpr)}px, ${snap(y - box.h, dpr)}px)`
    sprite.toggleAttribute('data-dark', dark)
  }

  function wake() {
    if (!raf && !stopped) raf = requestAnimationFrame(tick)
  }

  function stopIdle() {
    idleRun += 1
    idling = false
  }

  /** Breathing, a blink every third breath, and one tie-straightening beat after four still seconds. */
  async function idle() {
    if (idling) return
    idling = true
    const run = ++idleRun
    const still = () => run === idleRun && !stopped
    let elapsed = 0
    let settled = false
    for (let breath = 1; still(); breath += 1) {
      const blink = breath % 3 === 0
      let beat = blink ? [frames('idle')[0], ...frames('blink'), ...frames('idle').slice(1)] : frames('idle')
      if (!settled && elapsed >= 4000) {
        settled = true
        beat = frames('settle')
      }
      for (const frame of beat) {
        if (!still()) return
        show(sprite, frame, scale)
        await wait(frame[2])
        elapsed += frame[2]
      }
    }
  }

  async function sequence(task: () => Promise<void>) {
    busy = true
    stopIdle()
    await task()
    busy = false
    walked = 0
    lastTime = 0
    wake()
  }

  /** Departures are only played when the visitor can see them. */
  function onScreen() {
    const { y } = positionAt(points, p)
    return !sprite.hidden && y > window.scrollY && y - box.h < window.scrollY + window.innerHeight
  }

  const teleportTo = (next: number) =>
    sequence(async () => {
      if (onScreen()) await play(sprite, frames('teleportOut'), scale)
      p = next
      place()
      await play(sprite, frames('teleportIn'), scale)
    })

  const dock = () =>
    sequence(async () => {
      if (onScreen()) await play(sprite, frames('teleportOut'), scale)
      sprite.hidden = true
      isDocked = true
      root.dataset.companion = 'sidebar'
      if (slot) {
        await play(slot, frames('teleportIn'), pixelScale(1, dpr))
        show(slot, ['sidebar', 0], pixelScale(1, dpr))
      }
    })

  const undock = () =>
    sequence(async () => {
      if (slot) await play(slot, frames('teleportOut'), pixelScale(1, dpr))
      delete root.dataset.companion
      isDocked = false
      p = targetAt(points, line())
      place()
      sprite.hidden = false
      await play(sprite, frames('teleportIn'), scale)
    })

  function tick(now: number) {
    raf = 0
    if (busy || stopped || !points.length) return
    const dt = lastTime ? Math.min(now - lastTime, 64) : 16
    lastTime = now

    const shouldDock = docked(isDocked, window.scrollY, root.scrollHeight - window.innerHeight)
    if (shouldDock !== isDocked) {
      void (shouldDock ? dock() : undock())
      return
    }
    if (isDocked) return

    const to = targetAt(points, line())
    if (Math.abs(to - p) < 1e-6) {
      lastTime = 0
      void idle()
      return
    }
    stopIdle()

    // A long way to go (a fast scroll or a jump link): teleport there instead of a long walk.
    const gap = Math.abs(positionAt(points, to).y - positionAt(points, p).y)
    if (gap > 1.5 * window.innerHeight) {
      void teleportTo(to)
      return
    }

    const speed = Math.min(320, 60 + gap * 1.5) // CSS px per second
    const step = advance(points, p, to, (speed * dt) / 1000)
    p = step.p
    if (step.walked > 0) {
      walked += step.walked
      show(sprite, [walkClip(step.dx, step.dy), walkFrame(walked, 4 * scale)], scale)
      place()
    }
    if (step.blinkTo !== null) {
      const next = step.blinkTo
      void teleportTo(next)
      return
    }
    raf = requestAnimationFrame(tick)
  }

  let measured = false
  function measure() {
    if (stopped) return
    dpr = window.devicePixelRatio || 1
    scale = pixelScale(2, dpr)
    box = { w: sheet.frameWidth * scale, h: sheet.frameHeight * scale }
    dress(sprite, scale)
    if (slot) dress(slot, pixelScale(1, dpr))
    points = buildRoute(measureLedges(), measureObstacles(), window.innerHeight, box)
    sprite.hidden = isDocked || !points.length
    if (!points.length) return
    p = measured ? Math.min(p, points.length - 1) : targetAt(points, line())
    if (!measured) show(sprite, ['idle', 0], scale)
    measured = true
    place()
    wake()
  }

  let measureTimer = 0
  const remeasure = () => {
    window.clearTimeout(measureTimer)
    measureTimer = window.setTimeout(measure, 150)
  }
  const resizeObserver = new ResizeObserver(remeasure)
  resizeObserver.observe(document.body)
  const themeObserver = new MutationObserver(remeasure)
  themeObserver.observe(root, { attributeFilter: ['data-color-theme'] })
  window.addEventListener('scroll', wake, { passive: true })
  window.addEventListener('resize', remeasure)
  void document.fonts?.ready.then(remeasure)
  measure()

  return () => {
    stopped = true
    stopIdle()
    cancelAnimationFrame(raf)
    window.clearTimeout(measureTimer)
    timers.forEach((id) => window.clearTimeout(id))
    resizeObserver.disconnect()
    themeObserver.disconnect()
    window.removeEventListener('scroll', wake)
    window.removeEventListener('resize', remeasure)
    delete root.dataset.companion
  }
}
