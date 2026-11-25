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
import { existsSync, mkdtempSync, rmSync } from 'node:fs'
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
  await sleep(2500)
  await evaluate(WATCH)
}

/* ---------- In-page probes ---------- */

/** Records the clips shown, Email-link clicks / focus / press look, and section actions played away from their section. */
const WATCH = `(async () => {
  const meta = await (await fetch('/src/components/Companion/companion-sprites.json')).json()
  const rows = Object.fromEntries(Object.entries(meta.clips).map(([k, v]) => [v.row, k]))
  // Section-only actions. (The tie and the page also serve as idle beats anywhere, so they are not listed.)
  const owners = { sit: 'about', inspect: 'projects', pouch: 'skills', polish: 'certifications', pressLeft: 'contact', pressRight: 'contact' }
  const R = await import('/src/components/Companion/route.ts')
  const { planPlacements } = await import('/src/components/Companion/measure.ts')
  const w = (window.__qa = { clips: [], stray: [], clicks: 0, focus: 0, presses: 0, href: location.href })
  const email = document.querySelector('main a[href^="mailto:"]')
  if (email) {
    email.addEventListener('click', (e) => { w.clicks++; e.preventDefault() })
    email.addEventListener('focus', () => w.focus++)
    new MutationObserver(() => { if (email.hasAttribute('data-companion-press')) w.presses++ }).observe(email, { attributes: true, attributeFilter: ['data-companion-press'] })
  }
  const s = document.querySelector('[class*=sprite]')
  if (!s) return
  new MutationObserver(() => {
    const h = parseFloat(s.style.height); if (!h) return
    const clip = rows[Math.round(-parseFloat(s.style.backgroundPosition.split(' ')[1]) / h)]
    if (clip && w.clips.at(-1) !== clip) w.clips.push(clip)
    const owner = owners[clip]
    if (!owner) return
    const m = new DOMMatrix(getComputedStyle(s).transform)
    const route = R.tour(R.pickStops(planPlacements({ w: parseFloat(s.style.width), h }).anchors), innerHeight)
    const at = route.find((p) => Math.abs(p.y - (m.m42 + h)) < 1.5)
    if (at && at.ledge !== owner) w.stray.push(clip + ' while at ' + at.ledge)
  }).observe(s, { attributes: true, attributeFilter: ['style'] })
})()`

/** Is he on the reader's stop (or docked), with no bubble from elsewhere, and is all text in view visible and settled? */
const STATE = `(async () => {
  const R = await import('/src/components/Companion/route.ts')
  const { planPlacements } = await import('/src/components/Companion/measure.ts')
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
    const route = R.tour(R.pickStops(planPlacements(box).anchors), innerHeight)
    const want = route[R.targetAt(route, scrollY + 0.75 * innerHeight)]
    const m = new DOMMatrix(getComputedStyle(s).transform)
    const at = route.find((p) => Math.abs(p.y - (m.m42 + box.h)) < 1.5 && Math.abs(p.x - m.m41) < 1.5)
    if (!at) problems.push('not on a stop')
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
const settle = async () => {
  await sleep(4000)
  return evaluate(STATE)
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

try {
  for (const [w, h, label] of [[1280, 800, 'desktop'], [320, 640, '320px']]) {
    for (const [name, run] of Object.entries(scrollStates)) {
      await open({ width: w, height: h })
      await run()
      // At the bottom he finishes his goodbye and docks; give him time to get there.
      const st = name.includes('bottom') ? (await sleep(5000), await settle()) : await settle()
      if (name.includes('bottom') && !st.docked) st.problems.push('did not dock at the bottom')
      const stray = (await evaluate('window.__qa.stray')).length
      check(`${label}: ${name}`, !st.problems.length && !stray && st.overflow <= 0, [...st.problems, stray ? `${stray} action(s) out of section` : ''].filter(Boolean).join('; '))
    }
  }

  // Resize while on the route.
  await open()
  await evaluate(`scrollTo(0, document.getElementById('projects').getBoundingClientRect().top + scrollY)`)
  await sleep(2500)
  await size(820, 1000)
  await sleep(1500)
  await size(1280, 800)
  const afterResize = await settle()
  check('placement after resizing', !afterResize.problems.length, afterResize.problems.join('; '))

  // Contact goodbye at 320 px (room beside the Email button): press look, wave, dock; the real link untouched.
  await open({ width: 320, height: 640, dpr: 2 })
  await evaluate(`document.documentElement.style.scrollBehavior='auto'; scrollTo(0, document.getElementById('contact').getBoundingClientRect().top + scrollY - 40)`)
  await sleep(7000)
  let qa = await evaluate('window.__qa')
  check('contact: presses the Email button, waves, then docks', qa.presses > 0 && qa.clips.includes('wave') && (await evaluate(BRAND)).docked, qa.clips.filter((c) => /press|wave|teleport/.test(c)).join(' > '))
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
  check('reduced motion: no walking, waving, pressing, or teleporting; docks', !qa.clips.some((c) => /walk|wave|press|teleport/.test(c)) && (await evaluate(BRAND)).docked, qa.clips.join(' > '))

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
