import { companionActions, companionLines } from '../../content/companion'
import sheetUrl from './companion-sprites.png'
import sheet from './companion-sprites.json'
import { measureLines, planRoute } from './measure'
import {
  BRIEF_WALK,
  advance,
  brandScale,
  docked,
  isClear,
  nextMove,
  pixelScale,
  placeBubble,
  placeNote,
  positionAt,
  snap,
  walkClip,
  walkFrame,
  walkingDistance,
  type Box,
  type Rect,
  type RoutePoint,
} from './route'

type Clip = keyof typeof sheet.clips
type Frame = [clip: Clip, index: number, ms: number]

/** He aims for the route point level with this share of the viewport height. */
const LINE = 0.75
/** Section actions wait until he is standing on a stop and scrolling has paused this long. */
const SETTLE_MS = 600
/** A line shows this long. */
const BUBBLE_MS = 3500
/** At Contact his line stays up this long before he steps back and waves (then it closes). */
const GOODBYE_READ_MS = 2600
/** The short walk on each card is an unhurried stroll (CSS px per second). */
const STROLL_SPEED = 70

/** Once he reaches the brand slot he stays there until the page is reloaded, even if the companion restarts. */
let dockedThisLoad = false
/** Each section's line and action play once per page load. */
const said = new Set<string>()
const acted = new Set<string>()

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
  /** Play a short reaction (theme switch, sound on, a download or link) if he is free and in view. */
  react: (reaction: Reaction) => void
}

/**
 * Runs the companion: plans one stop per section, follows the scroll, walks
 * briefly and talks on each card, performs the section action once the
 * reader pauses, says goodbye at Contact, and docks in the brand slot.
 *
 * Ownership: every sequence (idle beats, actions, teleports, reactions,
 * docking) claims a new generation and checks it before each frame, so a
 * newer claim (a teleport for a fast scroll, a dialog, the mobile menu)
 * silently ends any older one. Where he goes is always derived from the
 * latest scroll position (`nextMove`), never from a queue of moves.
 *
 * `still` (reduced motion): no travelling or animation; a still figure at
 * the last section, then the brand slot at the bottom of the page.
 */
export function startCompanion(sprite: HTMLElement, bubble: HTMLElement, slot: HTMLElement | null, still: boolean): CompanionHandle {
  const root = document.documentElement
  let stopped = false
  let points: RoutePoint[] = []
  let obstacles: Rect[] = [] // what his speech bubble avoids
  let controls: Rect[] = [] // what it never covers, even briefly
  let bounds = { x0: 0, x1: 0 }
  let p = 0
  let walked = 0
  let isDocked = dockedThisLoad
  let busy = false // a teleport, reaction, or docking owns him
  let idling = false
  let raf = 0
  let lastTime = 0
  let scale = 2
  let slotScale: number | null = null
  let box: Box = { w: 48, h: 64 }
  let dpr = 1
  let lastScroll = performance.now()
  let paused = false // a dialog or the mobile menu is open
  let sheetReady = false
  const timers = new Set<number>()

  /* ---------- Ownership ---------- */

  let generation = 0
  /** Start a new owner; every older sequence stops at its next frame. */
  const claim = () => {
    generation += 1
    idling = false
    const mine = generation
    return () => mine === generation && !stopped
  }

  const wait = (ms: number) =>
    new Promise<void>((resolve) => {
      const id = window.setTimeout(() => {
        timers.delete(id)
        resolve()
      }, ms)
      timers.add(id)
    })

  async function play(el: HTMLElement, list: Frame[], s: number, owns: () => boolean) {
    for (const frame of list) {
      if (!owns()) return false
      show(el, frame, s)
      await wait(frame[2])
    }
    return owns()
  }

  const line = () => window.scrollY + LINE * window.innerHeight

  function place() {
    const { x, y, dark } = positionAt(points, p)
    sprite.style.transform = `translate(${snap(x, dpr)}px, ${snap(y - box.h, dpr)}px)`
    sprite.toggleAttribute('data-dark', dark)
    bubble.toggleAttribute('data-dark', dark)
    followSpeech()
    yieldToFocus()
  }

  function wake() {
    if (!raf && !stopped) raf = requestAnimationFrame(tick)
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

  /** Fully in view (below the top bar on narrow screens), so nothing starts where it cannot be seen. */
  function inClearView() {
    const { y } = positionAt(points, p)
    const header = document.querySelector('header')?.getBoundingClientRect()
    const top = header && header.width >= window.innerWidth * 0.9 ? header.bottom : 0
    return !sprite.hidden && y - box.h >= window.scrollY + top + 4 && y <= window.scrollY + window.innerHeight
  }

  /** Departures are only played when the visitor can see them. */
  function onScreen() {
    const { y } = positionAt(points, p)
    return !sprite.hidden && y > window.scrollY && y - box.h < window.scrollY + window.innerHeight
  }

  /* ---------- Speech: a line belongs to the stop where he said it ---------- */

  let speaking: string | undefined
  let bubbleSize: Box = { w: 0, h: 0 }
  let bubbleTimer = 0

  function hideBubble() {
    window.clearTimeout(bubbleTimer)
    bubble.hidden = true
    speaking = undefined
  }

  /** The part of the page in view, below the top bar on narrow screens. */
  function view(): Rect {
    const header = document.querySelector('header')?.getBoundingClientRect()
    const top = (header && header.width >= window.innerWidth * 0.9 ? header.bottom : 0) + 4
    return { x: bounds.x0, y: window.scrollY + top, w: bounds.x1 - bounds.x0, h: window.innerHeight - top - 4 }
  }

  /**
   * Put the bubble where it can be read, in view, pointing at him: beside him
   * where it covers nothing; else the nearest clear spot that still touches
   * him; else beside him (above his head first) over text, which it hides
   * only while he speaks, but never over a link, control, or image; else the
   * nearest clear spot in view. False when there is none.
   */
  function placeSpeech() {
    const { x, y } = positionAt(points, p)
    const v = view()
    const outOfView = [
      { x: -1e5, y: -1e5, w: 2e5, h: 1e5 + v.y },
      { x: -1e5, y: v.y + v.h, w: 2e5, h: 1e5 },
    ]
    let spot = placeBubble(x, y, bubbleSize, [...obstacles, ...outOfView], bounds, box)
    if (!spot) {
      const clear = placeNote(x, y, bubbleSize, obstacles, v, box)
      spot = clear && clear.tail !== 'none' ? clear : (placeBubble(x, y, bubbleSize, [...controls, ...outOfView], bounds, box) ?? clear)
    }
    if (!spot) return false
    shownAt = { x: spot.x, y: spot.y, ...bubbleSize }
    bubble.dataset.tail = spot.tail
    bubble.style.setProperty('--at', `${Math.round(spot.at)}px`)
    bubble.style.transform = `translate(${snap(spot.x, dpr)}px, ${snap(spot.y, dpr)}px)`
    return true
  }

  /** Where the bubble is showing, in page coordinates. */
  let shownAt: Rect | null = null

  /**
   * Re-place his line after he or the page moves. While content is still
   * settling there may briefly be no spot at all: the line then stays where
   * it is, as long as it is still in view and off every control, rather than
   * blinking out and back.
   */
  function followSpeech() {
    if (!speaking || placeSpeech()) return
    const v = view()
    bubble.hidden = !(shownAt && shownAt.y >= v.y && shownAt.y + shownAt.h <= v.y + v.h && isClear(shownAt, controls))
  }

  /** Standing still on a stop: say its section's line, once per visit. At Contact the goodbye says it. */
  function speak() {
    const section = points[p]?.ledge
    if (section && (still || companionActions[section]?.[0] !== 'goodbye')) say(section)
  }

  /** Show a section's line where it can be read; it closes after `ms`, or when the caller closes it. */
  function say(section: string, ms = BUBBLE_MS) {
    const text = companionLines[section]
    if (!text || said.has(section) || speaking || !inClearView()) return false
    bubble.textContent = text
    bubble.style.visibility = 'hidden'
    bubble.hidden = false
    const { width, height } = bubble.getBoundingClientRect()
    bubbleSize = { w: width, h: height }
    bubble.style.visibility = ''
    if (!placeSpeech()) {
      bubble.hidden = true
      return false
    }
    said.add(section)
    speaking = section
    if (Number.isFinite(ms)) {
      bubbleTimer = window.setTimeout(() => {
        hideBubble()
        wake() // he may be waiting to finish before docking
      }, ms)
    }
    return true
  }

  /* ---------- Standing still: section action, then idle beats ---------- */

  async function idle() {
    if (idling) return
    const owns = claim()
    idling = true
    if (still) {
      show(sprite, ['idle', 0], scale)
      return
    }
    const variety: Clip[] = ['settle', 'look', 'document']
    let elapsed = 0
    let nextBeat = 4000
    for (let breath = 1; owns(); breath += 1) {
      const here = points[p]
      const section = here?.acts ? here.ledge : undefined
      if (section && !acted.has(section) && performance.now() - lastScroll >= SETTLE_MS && inClearView()) {
        const steps = companionActions[section] ?? []
        if (steps[0] === 'goodbye') {
          if (await goodbye(owns)) return
        } else {
          for (const clip of steps) if (isClip(clip) && !(await play(sprite, frames(clip), scale, owns))) return
          acted.add(section)
        }
        elapsed = 0
        continue
      }
      let beat = breath % 3 === 0 ? [frames('idle')[0], ...frames('blink'), ...frames('idle').slice(1)] : frames('idle')
      if (elapsed >= nextBeat) {
        beat = frames(variety[Math.floor(elapsed / 5000) % variety.length])
        nextBeat = elapsed + 5000
      }
      for (const frame of beat) {
        if (!owns()) return
        show(sprite, frame, scale)
        await wait(frame[2])
        elapsed += frame[2]
      }
    }
  }

  /**
   * Contact: he faces the Email button and presses it (the button shows only
   * its own pressed look; nothing is clicked, focused, or opened), says his
   * last line and lets it be read, steps back, waves goodbye, closes the
   * line, and teleports to the brand slot. Skips the press when the button
   * is not beside him on his ground line; the line, wave, and docking still
   * play. Cancelled cleanly if the reader scrolls away. Returns true once
   * he has docked.
   */
  async function goodbye(owns: () => boolean) {
    const button = document.querySelector<HTMLElement>('main a[href^="mailto:"]')
    const here = positionAt(points, p)
    const r = button?.getBoundingClientRect()
    const level = r && Math.abs(r.bottom + window.scrollY - here.y) <= 2
    const gap = r ? Math.min(Math.abs(r.left + window.scrollX - (here.x + box.w)), Math.abs(here.x - (r.right + window.scrollX))) : Infinity
    const beside = button && level && gap <= 2 * box.w
    const toLeft = beside && r!.left + window.scrollX < here.x
    try {
      if (beside) {
        const press = frames(toLeft ? 'pressLeft' : 'pressRight')
        for (const [i, frame] of press.entries()) {
          if (!owns()) return false
          show(sprite, frame, scale)
          button!.toggleAttribute('data-companion-press', i === 1)
          await wait(frame[2])
        }
        button!.removeAttribute('data-companion-press')
      }
      if (say('contact', Infinity) && !(await play(sprite, [['idle', 0, GOODBYE_READ_MS]], scale, owns))) return false
      if (beside) {
        // Step back two paces, facing away from the button.
        for (const pace of [1, 2]) {
          if (!owns()) return false
          show(sprite, [toLeft ? 'walkRight' : 'walkLeft', pace], scale)
          sprite.style.transform = `translate(${snap(here.x + (toLeft ? 8 : -8) * pace, dpr)}px, ${snap(here.y - box.h, dpr)}px)`
          await wait(140)
        }
      }
      if (!(await play(sprite, frames('wave'), scale, owns))) return false
    } finally {
      button?.removeAttribute('data-companion-press')
      if (!owns()) {
        // Cancelled: back to his route position; the line comes back with the goodbye next time.
        if (speaking === 'contact') hideBubble()
        said.delete('contact')
        place()
      }
    }
    hideBubble()
    acted.add('contact')
    if (!slotScale || !sheetReady) return false
    await dock()
    return true
  }

  /* ---------- Teleports, docking, reactions ---------- */

  /** One owner at a time: idle beats end, and the route resumes when this finishes or is overtaken. */
  async function sequence(task: (owns: () => boolean) => Promise<unknown>) {
    busy = true
    const owns = claim()
    try {
      await task(owns)
    } finally {
      busy = false
      walked = 0
      lastTime = 0
      wake()
    }
  }

  /** Teleport to the reader's stop. The destination is read after the departure, so a fast scroll never queues stale stops. */
  const teleport = () =>
    sequence(async (owns) => {
      hideBubble()
      // Placement before animation: a scroll that skips more than one section gets no departure.
      const ahead = nextMove(points, p, line())
      const skipped = ahead.kind === 'teleport' && points.slice(Math.min(p, ahead.to) + 1, Math.max(p, ahead.to) + 1).filter((q) => q.blink).length > 1
      if (onScreen() && !skipped && !(await play(sprite, frames('teleportOut'), scale, owns))) return
      const move = nextMove(points, p, line())
      if (move.kind === 'teleport') p = move.to
      place()
      await play(sprite, frames('teleportIn'), scale, owns)
    })

  async function dock() {
    if (!slotScale || !sheetReady || !slot) return
    isDocked = true
    dockedThisLoad = true
    hideBubble()
    // Docking commits once it starts: its frames are not cancelled by newer claims.
    await sequence(async () => {
      if (!still && onScreen()) await play(sprite, frames('teleportOut'), scale, () => !stopped)
      sprite.hidden = true
      root.dataset.companion = 'sidebar'
      if (!still) await play(slot, frames('teleportIn'), slotScale!, () => !stopped)
      show(slot, ['sidebar', 0], slotScale!)
    })
  }

  function react(reaction: Reaction) {
    if (stopped || still || busy || isDocked || paused || !onScreen()) return
    void sequence((owns) => play(sprite, frames(reaction), scale, owns))
  }

  /* ---------- Following the scroll (one frame-coordinated update) ---------- */

  function tick(now: number) {
    raf = 0
    if (busy || stopped || paused || isDocked || !points.length) return
    const dt = lastTime ? Math.min(now - lastTime, 64) : 16
    lastTime = now

    const atBottom = docked(false, window.scrollY, root.scrollHeight - window.innerHeight)
    const move = nextMove(points, p, line())

    if (move.kind === 'teleport') {
      if (still) {
        p = move.to
        place()
      } else return void teleport()
    }
    if (move.kind === 'walk' && !still) {
      if (idling) claim() // stop the idle beat; he is moving again
      // His short walk is an unhurried stroll; a longer one (to where his line fits) is brisker.
      const remaining = walkingDistance(points, p, move.to)
      const speed = remaining > BRIEF_WALK ? Math.min(420, 90 + remaining * 2) : STROLL_SPEED
      const step = advance(points, p, move.to, (speed * dt) / 1000)
      p = step.p
      walked += step.walked
      show(sprite, [walkClip(step.dx, step.dy), walkFrame(walked, 4 * scale)], scale)
      place()
      raf = requestAnimationFrame(tick)
      return
    }
    if (move.kind === 'walk') p = move.to

    // Standing still: talk, then the section action and idle beats.
    lastTime = 0
    walked = 0
    place()
    speak()
    // At the bottom: with reduced motion, or when his last stop has no goodbye to play, he goes to the
    // brand slot once his line is done. Otherwise the goodbye (a section action) ends with docking.
    const last = points[points.length - 1]
    const goodbyeHere = !still && last.acts && companionActions[last.ledge ?? '']?.[0] === 'goodbye'
    if (atBottom && p === points.length - 1 && !speaking && !(goodbyeHere && inClearView())) return void dock()
    void idle()
  }

  /* ---------- Measuring, and pausing for dialogs and the mobile menu ---------- */

  let measured = false
  function measure() {
    if (stopped) return
    dpr = window.devicePixelRatio || 1
    scale = pixelScale(2, dpr)
    box = { w: sheet.frameWidth * scale, h: sheet.frameHeight * scale }
    dress(sprite, scale)

    // Brand slot: no taller than the name beside it (or the mark, when the name is hidden).
    const name = document.querySelector('header a[href="#top"] > span:last-of-type')?.getBoundingClientRect()
    const mark = slot?.parentElement?.getBoundingClientRect()
    const limit = name && name.width > 2 ? name.height : (mark?.height ?? 0)
    slotScale = brandScale(limit, dpr)
    if (slot && slotScale) {
      dress(slot, slotScale)
      if (isDocked) show(slot, ['sidebar', 0], slotScale)
    }
    if (isDocked) {
      if (slotScale && sheetReady) root.dataset.companion = 'sidebar'
      else delete root.dataset.companion
      sprite.hidden = true
      return
    }

    // Each stop ends where his line has a clear bubble spot (lines measured as they will render).
    const plan = planRoute(box, measureLines(bubble, companionLines), still)
    obstacles = plan.bubbleObstacles
    controls = plan.controls
    bounds = plan.bounds
    points = plan.points
    sprite.hidden = !points.length || paused
    if (!points.length) return hideBubble()
    const move = nextMove(points, measured ? p : -1, line())
    if (!measured) p = move.kind === 'teleport' ? move.to : 0
    p = Math.min(p, points.length - 1)
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
    const owns = claim()
    hideBubble()
    if (menu) sprite.hidden = true
    else if (!isDocked) sprite.hidden = !points.length
    if (dialog && !sprite.hidden && !still) {
      void (async () => {
        while (owns() && paused) await play(sprite, frames('notes'), scale, owns)
      })()
    }
    if (!paused) remeasure()
  }

  let measureTimer = 0
  function remeasure() {
    window.clearTimeout(measureTimer)
    measureTimer = window.setTimeout(measure, 150)
  }
  let settleTimer = 0
  /**
   * Content moves while it animates in (reveals, the hero entrance), and a
   * reveal can start after he measured. Measure again whenever one ends.
   */
  const onContentSettled = (event: AnimationEvent) => {
    if ((event.target as Element).closest('main, footer')) remeasure()
  }
  const onScroll = () => {
    lastScroll = performance.now()
    wake()
    // Look again once scrolling pauses, so the section action can start.
    window.clearTimeout(settleTimer)
    settleTimer = window.setTimeout(wake, SETTLE_MS + 20)
  }
  /** Downloads, links that open elsewhere, and the Email button (when the visitor uses it) get a small thumbs-up. Never delays the link. */
  const onClick = (event: MouseEvent) => {
    const link = (event.target as Element | null)?.closest?.('a')
    if (link && (link.hasAttribute('download') || link.target === '_blank' || link.protocol === 'mailto:')) {
      window.setTimeout(() => react('thumbsUp'), 150)
    }
  }

  const probe = new Image()
  probe.src = sheetUrl
  void probe.decode().then(
    () => {
      sheetReady = true
      // On tour: the page makes room for his goodbye (the space beside Email on desktop), then plans around it.
      if (!still && !isDocked) {
        root.dataset.companion = 'tour'
        remeasure()
      }
      wake()
    },
    () => {
      // The sheet could not load: no companion, and the "CB" mark stays.
      sprite.hidden = true
      delete root.dataset.companion
    },
  )

  const resizeObserver = new ResizeObserver(remeasure)
  resizeObserver.observe(document.body)
  const overlayObserver = new MutationObserver(checkOverlays)
  overlayObserver.observe(document.body, { subtree: true, attributeFilter: ['open', 'aria-expanded'] })
  window.addEventListener('scroll', onScroll, { passive: true })
  document.addEventListener('animationend', onContentSettled)
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
      claim()
      hideBubble()
      cancelAnimationFrame(raf)
      window.clearTimeout(measureTimer)
      window.clearTimeout(settleTimer)
      timers.forEach((id) => window.clearTimeout(id))
      resizeObserver.disconnect()
      overlayObserver.disconnect()
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('animationend', onContentSettled)
      window.removeEventListener('resize', remeasure)
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('focusin', yieldToFocus)
      document.removeEventListener('focusout', yieldToFocus)
      document.querySelector('[data-companion-press]')?.removeAttribute('data-companion-press')
      delete root.dataset.companion
    },
  }
}
