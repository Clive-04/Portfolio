import { companionActions, companionLines } from '../../content/companion'
import sheetUrl from './companion-sprites.png'
import sheet from './companion-sprites.json'
import { planPlacements } from './measure'
import {
  advance,
  docked,
  pickStops,
  tour,
  pixelScale,
  placeBubble,
  positionAt,
  snap,
  targetAt,
  walkClip,
  walkFrame,
  walkingDistance,
  type Box,
  type Rect,
  type RoutePoint,
} from './route'

type Clip = keyof typeof sheet.clips
type Frame = [clip: Clip, index: number, ms: number]

/** The companion aims for the route point level with this share of the viewport height. */
const LINE = 0.75
/** Section actions wait until he is standing on an anchor and scrolling has paused this long. */
const SETTLE_MS = 600

/** Once he reaches the brand slot he stays there until the page is reloaded, even if the companion restarts (resize, design switch). */
let dockedThisLoad = false
/** Each section's line and action play once per page load. */
const said = new Set<string>()
const acted = new Set<string>()
/** A line shows for 3.5 s; after 2 s a newer section's line may take over; a teleport pause never stretches it past 6 s. */
const BUBBLE_MS = 3500
const MIN_READ_MS = 2000
const MAX_SPEECH_MS = 6000

const isClip = (name: string): name is Clip => name in sheet.clips
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
  // His own outline already sits on the surface when seated; the ground shadow is for standing poses.
  el.toggleAttribute('data-seated', clip === 'sit')
}

export type Reaction = 'shield' | 'lantern' | 'music' | 'thumbsUp'

export interface CompanionHandle {
  stop: () => void
  /** Play a short reaction (theme switch, sound on, a successful download or link) if he is free and in view. */
  react: (reaction: Reaction) => void
}

/**
 * Runs the companion: plans his anchors, follows the scroll, says a line and
 * performs a section action on the cards, reacts to the page, and docks in
 * the brand slot at the bottom. `stop()` removes every listener and timer and
 * restores the "CB" mark.
 */
export function startCompanion(sprite: HTMLElement, bubble: HTMLElement, slot: HTMLElement | null): CompanionHandle {
  const root = document.documentElement
  let stopped = false
  let points: RoutePoint[] = []
  let obstacles: Rect[] = []
  let bounds = { x0: 0, x1: 0 }
  let p = 0
  let walked = 0
  let isDocked = dockedThisLoad
  let bubbleTimer = 0
  let busy = false
  let raf = 0
  let lastTime = 0
  let idleRun = 0
  let idling = false
  let scale = 2
  let box: Box = { w: 48, h: 64 }
  let dpr = 1
  let lastScroll = performance.now()
  let paused = false // a dialog or the mobile menu is open
  const timers = new Set<number>()

  const wait = (ms: number) =>
    new Promise<void>((resolve) => {
      const id = window.setTimeout(() => {
        timers.delete(id)
        resolve()
      }, ms)
      timers.add(id)
    })

  async function play(el: HTMLElement, list: Frame[], s: number, still: () => boolean = () => !stopped) {
    for (const frame of list) {
      if (!still()) return
      show(el, frame, s)
      await wait(frame[2])
    }
  }

  const line = () => window.scrollY + LINE * window.innerHeight

  function place() {
    const { x, y, dark } = positionAt(points, p)
    sprite.style.transform = `translate(${snap(x, dpr)}px, ${snap(y - box.h, dpr)}px)`
    sprite.toggleAttribute('data-dark', dark)
    followSpeech()
    yieldToFocus()
  }

  /**
   * Never over a focus indicator: while a keyboard focus ring would touch
   * him (3 px outline + 2 px offset, plus a pixel), he and his bubble step
   * out of view, and come back when focus moves on.
   */
  const FOCUS_RING = 6
  function yieldToFocus() {
    const el = document.activeElement
    let touches = false
    if (el && el !== document.body && el.matches(':focus-visible')) {
      const f = el.getBoundingClientRect()
      const s = sprite.getBoundingClientRect()
      touches =
        f.width > 0 &&
        f.left - FOCUS_RING < s.right &&
        s.left < f.right + FOCUS_RING &&
        f.top - FOCUS_RING < s.bottom &&
        s.top < f.bottom + FOCUS_RING
    }
    sprite.style.visibility = touches ? 'hidden' : ''
    bubble.style.visibility = touches ? 'hidden' : ''
  }

  function wake() {
    if (!raf && !stopped) raf = requestAnimationFrame(tick)
  }

  function stopIdle() {
    idleRun += 1
    idling = false
  }

  /* ---------- Speech ---------- */

  let speaking: string | undefined
  let bubbleSize: Box = { w: 0, h: 0 }
  let speechEndsAt = 0
  let speechStartedAt = 0

  function hideBubble() {
    window.clearTimeout(bubbleTimer)
    bubble.hidden = true
    speaking = undefined
  }

  function speakFor(ms: number) {
    window.clearTimeout(bubbleTimer)
    speechEndsAt = performance.now() + ms
    bubbleTimer = window.setTimeout(hideBubble, ms)
  }

  /** The route point he is standing on, or undefined while walking between anchors. */
  function standingOn() {
    return Number.isInteger(p) ? points[p] : undefined
  }

  /** The section he is in (standing, or on a segment within one section). */
  function currentSection() {
    const a = points[Math.floor(p)]
    const b = points[Math.ceil(p)]
    return a?.ledge && a.ledge === b?.ledge ? a.ledge : undefined
  }

  /** Put the bubble beside him where it covers nothing; false when there is no such spot. */
  function placeSpeech() {
    const { x, y } = positionAt(points, p)
    const spot = placeBubble(x, y, bubbleSize, obstacles, bounds, box)
    if (!spot) return false
    bubble.dataset.tail = spot.tail
    bubble.style.setProperty('--at', `${Math.round(spot.at)}px`)
    bubble.style.transform = `translate(${snap(spot.x, dpr)}px, ${snap(spot.y, dpr)}px)`
    return true
  }

  /** On arriving in a section with a line he has not said yet this visit, say it. */
  function speak() {
    const section = currentSection()
    const text = section && companionLines[section]
    const busySpeaking = speaking && performance.now() - speechStartedAt < MIN_READ_MS
    if (!section || !text || said.has(section) || busySpeaking || !inClearView()) return
    bubble.textContent = text
    bubble.style.visibility = 'hidden'
    bubble.hidden = false
    const { width, height } = bubble.getBoundingClientRect()
    bubbleSize = { w: width, h: height }
    bubble.style.visibility = ''
    if (!placeSpeech()) {
      bubble.hidden = true
      return
    }
    said.add(section)
    speaking = section
    speechStartedAt = performance.now()
    speakFor(BUBBLE_MS)
  }

  /** Keep the bubble with him for its full time; it steps aside only while no clear spot exists. */
  function followSpeech() {
    if (speaking) bubble.hidden = !placeSpeech()
  }

  /* ---------- Standing still: section actions and idle variety ---------- */

  /**
   * Standing still. First his section's action, once he is on a card that
   * allows it and scrolling has paused; then breathing and blinking, with
   * a small contextual beat every few seconds (tie, a look around, his map).
   */
  async function idle() {
    if (idling) return
    idling = true
    const run = ++idleRun
    const still = () => run === idleRun && !stopped
    const variety: Clip[] = ['settle', 'look', 'document']
    let elapsed = 0
    let nextBeat = 4000
    for (let breath = 1; still(); breath += 1) {
      const here = standingOn()
      const action = here?.acts && here.ledge && !acted.has(here.ledge) ? companionActions[here.ledge] : undefined
      if (action && performance.now() - lastScroll >= SETTLE_MS && inClearView()) {
        acted.add(here!.ledge!)
        for (const clip of action) if (isClip(clip)) await play(sprite, frames(clip), scale, still)
        elapsed = 0
        continue
      }
      let beat = breath % 3 === 0 ? [frames('idle')[0], ...frames('blink'), ...frames('idle').slice(1)] : frames('idle')
      if (elapsed >= nextBeat) {
        beat = frames(variety[Math.floor(elapsed / 5000) % variety.length])
        nextBeat = elapsed + 5000
      }
      for (const frame of beat) {
        if (!still()) return
        show(sprite, frame, scale)
        await wait(frame[2])
        elapsed += frame[2]
      }
    }
  }

  /* ---------- Teleports, docking, reactions ---------- */

  /** A line in progress pauses while he teleports and carries on beside him after. */
  async function sequence(task: () => Promise<void>) {
    busy = true
    stopIdle()
    const remaining = speaking ? speechEndsAt - performance.now() : 0
    window.clearTimeout(bubbleTimer)
    bubble.hidden = true
    await task()
    const sinceStart = performance.now() - speechStartedAt
    if (speaking && !isDocked && sinceStart < MAX_SPEECH_MS) {
      speakFor(Math.min(Math.max(remaining, 1500), MAX_SPEECH_MS - sinceStart))
      followSpeech()
    } else hideBubble()
    busy = false
    walked = 0
    lastTime = 0
    wake()
  }

  /** Fully on screen and below the top tenth, so nothing starts as he is about to scroll away. */
  function inClearView() {
    const { y } = positionAt(points, p)
    return !sprite.hidden && y - box.h >= window.scrollY + 0.1 * window.innerHeight && y <= window.scrollY + window.innerHeight
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
      isDocked = true
      dockedThisLoad = true
      if (onScreen()) await play(sprite, frames('teleportOut'), scale)
      sprite.hidden = true
      root.dataset.companion = 'sidebar'
      if (slot) {
        await play(slot, frames('teleportIn'), pixelScale(1, dpr))
        show(slot, ['sidebar', 0], pixelScale(1, dpr))
      }
    })

  function react(reaction: Reaction) {
    if (stopped || busy || isDocked || paused || !onScreen()) return
    void sequence(() => play(sprite, frames(reaction), scale))
  }

  /** The anchor (a whole route point) to settle on near a fractional target: the nearer one, unless only the other is in view. */
  function restingPoint(to: number) {
    const inView = (i: number) => {
      const { y } = positionAt(points, i)
      return y - box.h >= window.scrollY && y <= window.scrollY + window.innerHeight
    }
    const near = Math.round(to)
    const far = near === Math.floor(to) ? Math.ceil(to) : Math.floor(to)
    return inView(near) || !inView(far) ? near : far
  }

  /* ---------- Following the scroll ---------- */

  function tick(now: number) {
    raf = 0
    if (busy || stopped || paused || !points.length) return
    const dt = lastTime ? Math.min(now - lastTime, 64) : 16
    lastTime = now

    if (isDocked) return
    if (docked(false, window.scrollY, root.scrollHeight - window.innerHeight)) {
      void dock()
      return
    }
    speak() // the moment he lands on an anchor, before taking another step

    let to = targetAt(points, line())
    // Scrolling has paused: never rest between anchors; finish the walk to the nearest one in view.
    if (performance.now() - lastScroll >= SETTLE_MS && !Number.isInteger(to)) to = restingPoint(to)
    if (Math.abs(to - p) < 1e-6) {
      lastTime = 0
      void idle()
      return
    }
    stopIdle()

    // Far behind (a fast scroll or a menu jump): one teleport straight to the
    // anchor at the reader's position, instead of crawling through every one.
    const walk = walkingDistance(points, p, to)
    const gap = Math.abs(positionAt(points, to).y - positionAt(points, p).y)
    if (gap > 1.5 * window.innerHeight || (walk !== Infinity && walk > 1.5 * window.innerHeight)) {
      void teleportTo(to > p ? Math.floor(to) : Math.ceil(to))
      return
    }

    // Brisker the further behind he is, so he keeps up; frames follow distance, so the feet still match.
    const speed = Math.min(420, 90 + Math.min(walk, 600) * 2) // CSS px per second
    const step = advance(points, p, to, (speed * dt) / 1000)
    p = step.p
    if (step.walked > 0) {
      walked += step.walked
      show(sprite, [walkClip(step.dx, step.dy), walkFrame(walked, 4 * scale)], scale)
      place()
      speak()
    }
    if (step.blinkTo !== null) {
      void teleportTo(step.blinkTo)
      return
    }
    raf = requestAnimationFrame(tick)
  }

  /* ---------- Measuring, and pausing for dialogs and the mobile menu ---------- */

  let measured = false
  function measure() {
    if (stopped) return
    dpr = window.devicePixelRatio || 1
    scale = pixelScale(2, dpr)
    box = { w: sheet.frameWidth * scale, h: sheet.frameHeight * scale }
    dress(sprite, scale)
    if (slot) {
      dress(slot, pixelScale(1, dpr))
      if (isDocked) show(slot, ['sidebar', 0], pixelScale(1, dpr))
    }
    if (isDocked) {
      root.dataset.companion = 'sidebar'
      sprite.hidden = true
      return
    }
    const plan = planPlacements(box)
    obstacles = plan.obstacles
    bounds = plan.bounds
    // One stop per section (its first card), walked along, with a teleport to the next section's.
    points = tour(pickStops(plan.anchors), window.innerHeight)
    // Too few safe places for a coherent route (very small screens): stay out of the way.
    sprite.hidden = points.length < 2 || paused
    if (points.length < 2) return hideBubble()
    p = measured ? Math.min(p, points.length - 1) : targetAt(points, line())
    if (!measured) show(sprite, ['idle', 0], scale)
    measured = true
    place()
    wake()
  }

  /** A modal dialog is open (case study): he stops and takes notes. The mobile menu is open: he steps out of view. */
  function checkOverlays() {
    const dialog = document.querySelector('dialog[open]')
    const menu = document.querySelector('header [aria-expanded="true"]')
    const nowPaused = Boolean(dialog || menu)
    if (nowPaused === paused) return
    paused = nowPaused
    stopIdle()
    hideBubble()
    if (menu) sprite.hidden = true
    else if (!isDocked) sprite.hidden = points.length < 2
    if (dialog && !sprite.hidden) {
      const run = ++idleRun
      void (async () => {
        while (run === idleRun && paused && !stopped) await play(sprite, frames('notes'), scale, () => run === idleRun && !stopped)
      })()
    }
    if (!paused) {
      lastTime = 0
      wake()
    }
  }

  let measureTimer = 0
  const remeasure = () => {
    window.clearTimeout(measureTimer)
    measureTimer = window.setTimeout(measure, 150)
  }
  let settleTimer = 0
  const onScroll = () => {
    lastScroll = performance.now()
    wake()
    // Look again once scrolling pauses, so he settles on an anchor and can act.
    window.clearTimeout(settleTimer)
    settleTimer = window.setTimeout(wake, SETTLE_MS + 20)
  }
  /** Downloads and links that open elsewhere get a small thumbs-up. */
  const onClick = (event: MouseEvent) => {
    const link = (event.target as Element | null)?.closest?.('a')
    if (link && (link.hasAttribute('download') || link.target === '_blank')) window.setTimeout(() => react('thumbsUp'), 150)
  }
  const resizeObserver = new ResizeObserver(remeasure)
  resizeObserver.observe(document.body)
  const overlayObserver = new MutationObserver(checkOverlays)
  overlayObserver.observe(document.body, { subtree: true, attributeFilter: ['open', 'aria-expanded'] })
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', remeasure)
  document.addEventListener('click', onClick, true)
  document.addEventListener('focusin', yieldToFocus)
  document.addEventListener('focusout', yieldToFocus)
  void document.fonts?.ready.then(remeasure)
  measure()
  checkOverlays()

  return {
    react,
    stop() {
      stopped = true
      stopIdle()
      hideBubble()
      cancelAnimationFrame(raf)
      window.clearTimeout(measureTimer)
      window.clearTimeout(settleTimer)
      timers.forEach((id) => window.clearTimeout(id))
      resizeObserver.disconnect()
      overlayObserver.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', remeasure)
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('focusin', yieldToFocus)
      document.removeEventListener('focusout', yieldToFocus)
      delete root.dataset.companion
    },
  }
}
