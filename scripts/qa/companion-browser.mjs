// Browser regression suite for the pixel companion and the scroll reveals.
//
// Drives an installed Edge or Chrome over the DevTools protocol (no extra
// dependencies) against the dev server, because some checks import the
// companion's own route code into the page.
//
//   npm run dev                       (in one terminal)
//   npm run qa:companion              (in another; QA_URL to change the address)
//
// Prints Passed / Failed for each check and exits non-zero on any failure.
import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const URL = process.env.QA_URL ?? 'http://localhost:5173/'
const BROWSERS = [
  process.env.QA_BROWSER,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean)
const browserPath = BROWSERS.find((p) => existsSync(p))
if (!browserPath) throw new Error('No Edge or Chrome found; set QA_BROWSER to its path.')

const PORT = 9400 + Math.floor(Math.random() * 400)
const profile = mkdtempSync(join(tmpdir(), 'companion-qa-'))
const browser = spawn(
  browserPath,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`,
    '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows',
    `--user-data-dir=${profile}`,
    'about:blank',
  ],
  { stdio: 'ignore' },
)
// Stopped early (Ctrl+C): close the browser too, so it does not keep running and slow the next run.
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => (browser.kill(), process.exit(130)))
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/* ---------- Minimal DevTools-protocol client ---------- */

let targets = []
for (let i = 0; i < 60 && !targets.some((t) => t.type === 'page'); i++) {
  await sleep(200)
  targets = await fetch(`http://127.0.0.1:${PORT}/json/list`).then((r) => r.json(), () => [])
}
const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl)
await new Promise((r) => ws.addEventListener('open', r, { once: true }))
let id = 0
const pending = new Map()
const errors = []
ws.addEventListener('message', (e) => {
  const msg = JSON.parse(e.data)
  if (msg.id) pending.get(msg.id)?.(msg)
  if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text)
  if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') errors.push(msg.params.args.map((a) => a.value ?? a.description).join(' '))
})
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const n = ++id
    pending.set(n, (m) => (pending.delete(n), m.error ? reject(new Error(`${method}: ${m.error.message}`)) : resolve(m.result)))
    ws.send(JSON.stringify({ id: n, method, params }))
  })
await send('Runtime.enable')
await send('Page.enable')
await send('Page.bringToFront')
await send('Emulation.setFocusEmulationEnabled', { enabled: true })

const evaluate = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text)
  return r.result.value
}
const size = (width, height, deviceScaleFactor = 1) =>
  send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor, mobile: false })
const motion = (reduce) =>
  send('Emulation.setEmulatedMedia', { features: reduce ? [{ name: 'prefers-reduced-motion', value: 'reduce' }] : [] })
const wheel = (deltaY, x = 400, y = 300) => send('Input.dispatchMouseEvent', { type: 'mouseWheel', x, y, deltaX: 0, deltaY })
const key = async (k, code) => {
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: k, code: k, windowsVirtualKeyCode: code })
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code: k, windowsVirtualKeyCode: code })
}

async function open({ width = 1280, height = 800, dpr = 1, design = 'pixel', theme = 'day', reduce = false } = {}) {
  await motion(reduce)
  await size(width, height, dpr)
  await send('Page.navigate', { url: URL })
  await sleep(400)
  await evaluate(`localStorage.clear(); localStorage.setItem('portfolio:sound-prompt-dismissed','true'); localStorage.setItem('portfolio:color-theme','${theme}'); localStorage.setItem('portfolio:design','${design}')`)
  await send('Page.navigate', { url: URL })
  // Start watching as soon as he exists, so his opening line is recorded too.
  const started = Date.now()
  while (Date.now() - started < 3000 && !(await evaluate(`!!document.querySelector('[class*=sprite]')`).catch(() => false))) await sleep(20)
  await evaluate(WATCH)
  await sleep(Math.max(0, 2500 - (Date.now() - started)))
}

/* ---------- In-page probes ---------- */

/** Records the clips shown, Email-link clicks / focus / press look, and section actions played away from their section. */
const WATCH = `(async () => {
  const meta = await (await fetch('/src/components/Companion/companion-sprites.json')).json()
  const rows = Object.fromEntries(Object.entries(meta.clips).map(([k, v]) => [v.row, k]))
  // Section-only actions. (The tie and the page also serve as idle beats anywhere, so they are not listed.)
  const owners = { sit: 'about', inspect: 'projects', pouch: 'skills', polish: 'certifications', pressLeft: 'contact', pressRight: 'contact' }
  // His route exactly as the engine plans it (lines measured in the live bubble).
  const M = await import('/src/components/Companion/measure.ts')
  const { companionLines } = await import('/src/content/companion.ts')
  const bubble = document.querySelector('[class*=bubble]')
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  const routeFor = (window.__routeFor = (box) => M.planRoute(box, M.measureLines(bubble, companionLines), reduce).points)
  const w = (window.__qa = { clips: [], stray: [], clicks: 0, focus: 0, presses: 0, href: location.href })
  const email = document.querySelector('main a[href^="mailto:"]')
  if (email) {
    email.addEventListener('click', (e) => { w.clicks++; e.preventDefault() })
    email.addEventListener('focus', () => w.focus++)
    new MutationObserver(() => { if (email.hasAttribute('data-companion-press')) w.presses++ }).observe(email, { attributes: true, attributeFilter: ['data-companion-press'] })
  }
  const s = document.querySelector('[class*=sprite]')
  if (!s) return
  // Timeline: each line shown (what it covers, whether it is in view or over him), closes, presses, waves, teleports, docking.
  const t0 = performance.now(), now = () => Math.round(performance.now() - t0)
  w.log = []
  let shown = null
  new MutationObserver(() => {
    if (bubble.hidden || bubble.style.visibility === 'hidden') {
      if (shown) w.log.push({ t: now(), ev: 'close', text: shown })
      shown = null
      return
    }
    if (shown === bubble.textContent) return
    shown = bubble.textContent
    const r = bubble.getBoundingClientRect(), hit = (o) => o.left < r.right && r.left < o.right && o.top < r.bottom && r.top < o.bottom
    const range = document.createRange()
    // Text it may cover while he speaks (the owner's call); links, controls, and images never.
    let overText = 0, overControls = 0
    for (const scope of document.querySelectorAll('main, footer')) {
      const tw = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.nodeValue.trim() ? 1 : 2) })
      for (let n = tw.nextNode(); n; n = tw.nextNode()) { range.selectNodeContents(n); for (const o of range.getClientRects()) if (hit(o)) overText++ }
      for (const el of scope.querySelectorAll('a, button, img, input, select, textarea, [tabindex]')) if (hit(el.getBoundingClientRect())) overControls++
    }
    const head = document.querySelector('header').getBoundingClientRect(), top = head.width >= innerWidth * 0.9 ? head.bottom : 0
    const inView = r.top >= top && r.bottom <= innerHeight && r.left >= 0 && r.right <= document.documentElement.clientWidth
    w.log.push({ t: now(), ev: 'say', text: shown, tail: bubble.dataset.tail, overText, overControls, inView, overHim: hit(s.getBoundingClientRect()) })
  }).observe(bubble, { attributes: true, attributeFilter: ['hidden', 'style'], childList: true })
  if (email) new MutationObserver(() => email.hasAttribute('data-companion-press') && w.log.push({ t: now(), ev: 'press' })).observe(email, { attributes: true, attributeFilter: ['data-companion-press'] })
  new MutationObserver(() => document.documentElement.dataset.companion === 'sidebar' && w.log.push({ t: now(), ev: 'docked' })).observe(document.documentElement, { attributes: true, attributeFilter: ['data-companion'] })
  new MutationObserver(() => {
    const h = parseFloat(s.style.height); if (!h) return
    const clip = rows[Math.round(-parseFloat(s.style.backgroundPosition.split(' ')[1]) / h)]
    if (clip && w.clips.at(-1) !== clip) {
      w.clips.push(clip)
      if (/wave|teleport/.test(clip)) w.log.push({ t: now(), ev: clip })
    }
    const owner = owners[clip]
    if (!owner) return
    const m = new DOMMatrix(getComputedStyle(s).transform)
    const route = routeFor({ w: parseFloat(s.style.width), h })
    const at = route.find((p) => Math.abs(p.y - (m.m42 + h)) < 1.5)
    if (at && at.ledge !== owner) w.stray.push(clip + ' while at ' + at.ledge)
  }).observe(s, { attributes: true, attributeFilter: ['style'] })
})()`

/** Is he on the reader's stop (or docked), with no bubble from elsewhere, and is all text in view visible and settled? */
const STATE = `(async () => {
  const R = await import('/src/components/Companion/route.ts')
  const { companionLines } = await import('/src/content/companion.ts')
  const problems = []
  for (const el of document.querySelectorAll('[data-reveal]')) {
    const r = el.getBoundingClientRect(); const cs = getComputedStyle(el)
    if (el.getAnimations().length) continue
    if (r.bottom > 40 && r.top < innerHeight - 40 && r.height > 0 && +cs.opacity < 0.99) problems.push('hidden text: ' + el.textContent.trim().slice(0, 30))
    if (cs.translate !== 'none' && cs.translate !== '0px') problems.push('stale translate on: ' + el.textContent.trim().slice(0, 30))
  }
  const s = document.querySelector('[class*=sprite]')
  const docked = document.documentElement.dataset.companion === 'sidebar'
  if (s && !docked && !s.hidden) {
    const box = { w: parseFloat(s.style.width), h: parseFloat(s.style.height) }
    const route = window.__routeFor(box)
    const want = route[R.targetAt(route, scrollY + 0.75 * innerHeight)]
    const m = new DOMMatrix(getComputedStyle(s).transform)
    // On a stop; at Contact his goodbye also steps back up to two 8 px paces from it.
    const reach = (p) => (p.ledge === 'contact' ? 16.5 : 1.5)
    const at = route.find((p) => Math.abs(p.y - (m.m42 + box.h)) < 1.5 && Math.abs(p.x - m.m41) < reach(p))
    if (!at) {
      const near = route.filter((p) => Math.abs(p.y - (m.m42 + box.h)) < 40).map((p) => p.ledge + ' ' + Math.round(p.x) + ',' + Math.round(p.y))
      problems.push('not on a stop: at ' + Math.round(m.m41) + ',' + Math.round(m.m42 + box.h) + (near.length ? '; nearest ' + near.join(' / ') : ''))
    }
    else if (at.ledge !== want.ledge) problems.push('at ' + at.ledge + ' but the reader is at ' + want.ledge)
    const b = document.querySelector('[class*=bubble]')
    if (at && b && !b.hidden) {
      const from = Object.entries(companionLines).find(([, t]) => t === b.textContent)?.[0]
      if (from !== at.ledge) problems.push('bubble from ' + from + ' while at ' + at.ledge)
    }
  }
  return { problems, docked, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth }
})()`

const BRAND = `(() => {
  const slot = document.querySelector('[data-companion-slot]'), mark = slot.parentElement, name = mark.nextElementSibling
  const s = slot.getBoundingClientRect(), n = name.getBoundingClientRect(), m = mark.getBoundingClientRect()
  const limit = n.width > 2 ? n.height : m.height
  return { docked: document.documentElement.dataset.companion === 'sidebar', h: s.height, limit, devicePx: (s.height / 32) * devicePixelRatio,
    centred: Math.abs(s.top + s.height / 2 - (m.top + m.height / 2)) < 0.6, cbVisible: getComputedStyle(mark).color !== 'rgba(0, 0, 0, 0)', rendering: getComputedStyle(slot).imageRendering }
})()`

/* ---------- Checks ---------- */

const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail })
  console.log(`${ok ? 'Passed' : 'FAILED'}  ${name}${detail ? '  — ' + detail : ''}`)
}
/** He finishes any walk or goodbye step on his own clock: check every half second, from 2 s up to 8 s after the input. */
const settle = async () => {
  await sleep(2000)
  let state = await evaluate(STATE)
  for (let waited = 2000; state.problems.length && waited < 8000; waited += 500) {
    await sleep(500)
    state = await evaluate(STATE)
  }
  return state
}
const scrollStates = {
  'slow scroll': async () => { for (let y = 0; y < 3400; y += 40) { await evaluate(`scrollTo(0, ${y})`); await sleep(40) } },
  'very fast wheel': async () => { for (let i = 0; i < 10; i++) { await wheel(1500); await sleep(16) } },
  'momentum fling': async () => { for (let d = 900; d > 20; d *= 0.85) { await wheel(d); await sleep(16) } },
  'scrollbar drag to the bottom': () => evaluate(`document.documentElement.style.scrollBehavior='auto'; scrollTo(0, document.documentElement.scrollHeight)`),
  'one update across several sections': () => evaluate(`document.documentElement.style.scrollBehavior='auto'; scrollTo(0, document.documentElement.scrollHeight * 0.6)`),
  'Page Down × 6': async () => { for (let i = 0; i < 6; i++) { await key('PageDown', 34); await sleep(60) } },
  'Page Up × 4': async () => { await evaluate(`scrollTo(0, document.documentElement.scrollHeight * 0.8)`); await sleep(300); for (let i = 0; i < 4; i++) { await key('PageUp', 33); await sleep(60) } },
  'End then Home': async () => { await key('End', 35); await sleep(400); await key('Home', 36) },
  'rapid reversal': async () => { for (const d of [1500, -1500, 1800, -900, 1200, -1600, 2000]) { await wheel(d); await sleep(40) } },
}

/** Docked, or "CB" kept because no whole-pixel sprite fits beside the name at this density. */
const dockedOrCB = async () => {
  const b = await evaluate(BRAND)
  return b.docked || (b.cbVisible && 32 / (await evaluate('devicePixelRatio')) > b.limit)
}

/** axe-core's WCAG 2.0–2.2 A and AA rules on the page as it is now: the violated rule ids, with how many elements. */
const AXE = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8')
const axe = async () => {
  await evaluate(`${AXE}; 0`)
  return evaluate(`axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } }).then((r) => r.violations.map((v) => v.id + ' (' + v.nodes.length + ')'))`)
}

/** Where he stops for a section, as the engine plans it. */
const stopY = (section) => evaluate(`(() => { const s = document.querySelector('[class*=sprite]'); return window.__routeFor({ w: parseFloat(s.style.width), h: parseFloat(s.style.height) }).find((p) => p.ledge === '${section}').y })()`)

let qa
const SECTIONS = ['start', 'about', 'projects', 'skills', 'resume', 'certifications', 'contact']
const LAYOUTS = [
  [1280, 800, 'desktop'],
  [1536, 864, 'wide desktop'],
  [820, 1000, 'tablet'],
  [390, 844, '390px'],
  [320, 640, '320px'],
]

try {
  for (const [i, [w, h, label]] of LAYOUTS.entries()) {
    const theme = i % 2 ? 'night' : 'day'
    for (const [name, run] of Object.entries(scrollStates)) {
      await open({ width: w, height: h, theme })
      await run()
      // At the bottom he finishes his goodbye and docks; give him time to get there.
      const st = await settle()
      if (name.includes('bottom')) {
        // His goodbye (press, line, wave) runs about 6 s before he docks: allow up to 12 s.
        let docked = await dockedOrCB()
        for (let waited = 0; !docked && waited < 12000; waited += 500) {
          await sleep(500)
          docked = await dockedOrCB()
        }
        if (!docked) st.problems.push('did not dock at the bottom')
      }
      const stray = (await evaluate('window.__qa.stray')).length
      check(`${label} ${theme}: ${name}`, !st.problems.length && !stray && st.overflow <= 0, [...st.problems, stray ? `${stray} action(s) out of section` : ''].filter(Boolean).join('; '))
    }
  }

  // Every line, read at a reader's pace, at each layout in Day and Night; then the Contact goodbye in order.
  const lines = await evaluate(`import('/src/content/companion.ts').then((m) => m.companionLines)`)
  for (const theme of ['day', 'night']) {
    for (const [w, h, label] of LAYOUTS) {
      await open({ width: w, height: h, theme })
      await sleep(1000)
      for (const section of SECTIONS.slice(1)) {
        const y = await stopY(section)
        // A reader's scroll: 40 px steps, his stop brought to 60% of the screen.
        await evaluate(`(async () => { document.documentElement.style.scrollBehavior = 'auto'; const to = Math.max(0, ${Math.round(y - h * 0.6)}); let at = scrollY; while (Math.abs(to - at) > 40) { at += Math.sign(to - at) * 40; scrollTo(0, at); await new Promise((r) => setTimeout(r, 40)) } scrollTo(0, to) })()`)
        await sleep(section === 'contact' ? 9000 : 4500)
      }
      qa = await evaluate('window.__qa')
      const says = qa.log.filter((e) => e.ev === 'say')
      const problems = SECTIONS.flatMap((s) => {
        const said = says.filter((e) => e.text === lines[s])
        if (!said.length) return [`${s} silent`]
        const bad = said.filter((e) => e.overControls || !e.inView || e.overHim || e.tail === 'none')
        const why = (e) => [e.overControls && `over ${e.overControls} control(s)`, !e.inView && 'out of view', e.overHim && 'over him', e.tail === 'none' && 'not pointing at him'].filter(Boolean).join(', ')
        return [said.length > 1 ? `${s} said ${said.length} times` : '', bad.length ? `${s} bubble ${why(bad[0])}` : ''].filter(Boolean)
      })
      const overText = SECTIONS.filter((s) => says.some((e) => e.text === lines[s] && e.overText))
      // Contact order: (press) > line > wave > line closes > docked (or "CB" kept at this density).
      const from = qa.log.findIndex((e) => e.ev === 'say' && e.text === lines.contact)
      const tail = qa.log.slice(Math.max(0, from - 3)).filter((e) => e.ev !== 'say' || e.text === lines.contact).filter((e) => !/teleportIn/.test(e.ev))
      const order = tail.map((e) => (e.ev === 'say' ? 'line' : e.ev === 'close' ? (e.text === lines.contact ? 'closes' : '') : e.ev)).filter(Boolean)
      const seq = order.slice(order.indexOf('line'))
      const shownFor = from >= 0 ? (qa.log.find((e, k) => k > from && e.ev === 'close' && e.text === lines.contact)?.t ?? Infinity) - qa.log[from].t : 0
      const okOrder = seq[0] === 'line' && seq.indexOf('wave') > 0 && seq.indexOf('closes') > seq.indexOf('wave') && shownFor >= 2500
      if (!okOrder) problems.push(`contact order: ${order.join(' > ')} (line shown ${shownFor} ms)`)
      if (!(await dockedOrCB())) problems.push('did not dock')
      if (qa.clicks || qa.focus || (await evaluate('location.href')) !== qa.href) problems.push('the Email link was activated')
      check(
        `dialogue ${label} ${theme}: all seven lines, beside him, never over a control; Contact goodbye in order`,
        !problems.length,
        problems.join('; ') || `${order.join(' > ')}${overText.length ? ` (briefly over text: ${overText.join(', ')})` : ''}`,
      )
    }
  }

  // axe-core: each layout in Day and Night with his opening line showing, then at the bottom after the goodbye, then Classic.
  for (const theme of ['day', 'night']) {
    for (const [w, h, label] of LAYOUTS) {
      await open({ width: w, height: h, theme })
      const found = await axe()
      check(`axe ${label} ${theme}: no WCAG A/AA violations`, !found.length, found.join(', '))
    }
  }
  await open()
  await evaluate(`document.documentElement.style.scrollBehavior='auto'; scrollTo(0, document.documentElement.scrollHeight)`)
  await sleep(8000)
  const atBottom = await axe()
  check('axe desktop at the bottom, docked: no WCAG A/AA violations', !atBottom.length, atBottom.join(', '))
  await open({ design: 'classic' })
  const classic = await axe()
  check('axe Classic: no WCAG A/AA violations', !classic.length, classic.join(', '))

  // Hidden from assistive technology and never focusable (sprite, bubble, and the brand slot).
  await open()
  const a11y = await evaluate(`(() => {
    const parts = [...document.querySelectorAll('[class*=sprite], [class*=bubble], [data-companion-slot]')]
    return parts.length === 3 && parts.every((el) => el.closest('[aria-hidden="true"]') && el.tabIndex < 0 && !el.querySelector('a, button, [tabindex]'))
  })()`)
  check('accessibility: companion, bubble, and brand sprite aria-hidden and not focusable', a11y)

  // Resize while on the route.
  await open()
  await evaluate(`scrollTo(0, document.getElementById('projects').getBoundingClientRect().top + scrollY)`)
  await sleep(2500)
  await size(820, 1000)
  await sleep(1500)
  await size(1280, 800)
  const afterResize = await settle()
  check('placement after resizing', !afterResize.problems.length, afterResize.problems.join('; '))

  // Contact goodbye at 320 px (room beside the Email button): press look, line, wave, dock; the real link untouched.
  await open({ width: 320, height: 640, dpr: 2 })
  await evaluate(`document.documentElement.style.scrollBehavior='auto'; scrollTo(0, document.getElementById('contact').getBoundingClientRect().top + scrollY - 40)`)
  await sleep(8000)
  qa = await evaluate('window.__qa')
  const pressedThenSaid = qa.log.findIndex((e) => e.ev === 'press') < qa.log.findIndex((e) => e.ev === 'say' && e.text === lines.contact)
  check('contact: presses the Email button, says goodbye, waves, then docks', qa.presses > 0 && pressedThenSaid && qa.clips.includes('wave') && (await evaluate(BRAND)).docked, qa.clips.filter((c) => /press|wave|teleport/.test(c)).join(' > '))
  check('contact: the automatic press never clicks, focuses, or opens the Email link', qa.clicks === 0 && qa.focus === 0 && (await evaluate('location.href')) === qa.href && (await evaluate('document.activeElement === document.body')))

  // Cancel the goodbye by scrolling away.
  await open()
  await evaluate(`document.documentElement.style.scrollBehavior='auto'; scrollTo(0, document.getElementById('contact').getBoundingClientRect().top + scrollY - 150)`)
  for (let i = 0; i < 60; i++) { await sleep(80); if ((await evaluate('window.__qa.clips')).some((c) => /press|wave/.test(c))) break }
  await evaluate(`scrollTo(0, document.getElementById('projects').getBoundingClientRect().top + scrollY)`)
  const cancelled = await settle()
  check('contact: scrolling away cancels the goodbye cleanly', !cancelled.docked && !(await evaluate(`!!document.querySelector('[data-companion-press]')`)) && !cancelled.problems.length, cancelled.problems.join('; '))

  // Brand slot sizing: never taller than the name, whole device pixels, centred, pixelated; CB fallback when it cannot fit.
  for (const [w, h, dpr] of [[1280, 800, 1], [1280, 800, 2], [1280, 800, 1.25], [390, 844, 3], [320, 200, 4], [820, 1000, 1]]) {
    await open({ width: w, height: h, dpr })
    await evaluate(`document.documentElement.style.scrollBehavior='auto'; scrollTo(0, document.documentElement.scrollHeight)`)
    await sleep(7000)
    const b = await evaluate(BRAND)
    const ok = b.docked
      ? b.h <= b.limit + 0.01 && Math.abs(b.devicePx - Math.round(b.devicePx)) < 0.01 && b.centred && b.rendering === 'pixelated' && !b.cbVisible
      : b.cbVisible && 32 / dpr > b.limit
    check(`brand slot ${w}×${h} @${dpr}x`, ok, b.docked ? `${b.h.toFixed(1)} px beside a ${b.limit.toFixed(1)} px name, ${b.devicePx} device px per sprite px` : '"CB" kept: no whole-pixel size fits beside the name')
  }

  // Reduced motion: a still figure, then the brand slot, no animation.
  await open({ reduce: true })
  await evaluate(`document.documentElement.style.scrollBehavior='auto'; scrollTo(0, document.documentElement.scrollHeight)`)
  await sleep(5500) // his Contact line (3.5 s) first, then the brand slot
  qa = await evaluate('window.__qa')
  const stillSaid = qa.log.some((e) => e.ev === 'say' && e.text === lines.contact)
  check('reduced motion: says goodbye; no walking, waving, pressing, or teleporting; docks', stillSaid && !qa.clips.some((c) => /walk|wave|press|teleport/.test(c)) && (await evaluate(BRAND)).docked, qa.clips.join(' > '))

  // Classic: unchanged.
  await open({ design: 'classic' })
  await evaluate(`scrollTo(0, document.documentElement.scrollHeight)`)
  await sleep(1500)
  check('Classic: no companion, "CB" unchanged', !(await evaluate(`!!document.querySelector('[class*=sprite]')`)) && (await evaluate(BRAND)).cbVisible)

  check('no console errors', errors.length === 0, errors.slice(0, 3).join(' | '))
} finally {
  ws.close()
  browser.kill()
  await sleep(300)
  rmSync(profile, { recursive: true, force: true })
}

const failed = results.filter((r) => !r.ok).length
console.log(`\n${results.length - failed} passed, ${failed} failed`)
process.exitCode = failed ? 1 : 0
