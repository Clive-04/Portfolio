/**
 * Local sound lab (sound-lab.html, dev server only; never built or deployed).
 *
 * Play each interface cue, adjust the overall volume and each cue's pitch and
 * length, then copy the settings block and paste it back to Claude Code, which
 * applies it to src/lib/sound.ts. Nothing here changes the site by itself.
 */
import '@fontsource-variable/plus-jakarta-sans'
import '../styles/global.css'
import { VOLUME, cues, playNotes, type Note, type SoundName } from '../lib/sound'

const descriptions: Record<SoundName, string> = {
  navigate: 'Jumping to a section, switching skill tabs, Previous/Next between case studies',
  confirm:
    'Day/Night, turning sound on, switching designs, email and external links (LinkedIn, GitHub, Verify, Credly, Live, Code), pausing the technology strip',
  back: 'Closing a dialog or the phone menu, turning sound off',
  open: 'Opening a project case study or the phone menu',
  download: 'Starting the résumé download',
}

interface Tuning {
  pitch: number
  length: number
}

const names = Object.keys(cues) as SoundName[]
const tuning = Object.fromEntries(names.map((name) => [name, { pitch: 1, length: 1 }])) as Record<SoundName, Tuning>
let volume = VOLUME

/** A cue with pitch (frequency) and length (timing) multipliers applied. */
function tuned(name: SoundName): Note[] {
  const { pitch, length } = tuning[name]
  return cues[name].map((note) => ({
    ...note,
    freq: Math.round(note.freq * pitch * 100) / 100,
    at: Math.round(note.at * length * 1000) / 1000,
    dur: Math.round(note.dur * length * 1000) / 1000,
  }))
}

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Record<string, string | number | boolean> = {},
  ...children: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  Object.assign(node, props)
  node.append(...children)
  return node
}

/** A labelled range input that shows its value. */
function slider(label: string, min: number, max: number, step: number, value: number, onInput: (value: number) => void) {
  const id = `s-${Math.random().toString(36).slice(2)}`
  const output = element('output', { value: value.toFixed(2) })
  output.setAttribute('for', id)
  const input = element('input', { id, type: 'range', min: String(min), max: String(max), step: String(step), value: String(value) })
  input.addEventListener('input', () => {
    output.value = Number(input.value).toFixed(2)
    onInput(Number(input.value))
    renderSettings()
  })
  return element('div', { className: 'lab-slider' }, element('label', { htmlFor: id }, label), input, output)
}

const settings = element('textarea', { readOnly: true, rows: 14, className: 'lab-settings' })
settings.setAttribute('aria-label', 'Current settings to paste back')

function renderSettings() {
  settings.value = JSON.stringify({ volume: Number(volume.toFixed(3)), cues: tuning }, null, 2)
}

const root = document.getElementById('lab')
if (root) {
  const style = element('style')
  style.textContent = `
    body { padding: 2rem 1rem; }
    .lab { max-width: 46rem; margin: 0 auto; display: grid; gap: 1.25rem; }
    .lab h1 { font-family: var(--font-display); font-size: 2rem; text-transform: uppercase; }
    .lab-note { color: var(--color-text-muted); }
    .lab-cue { display: grid; gap: .75rem; padding: 1rem 1.25rem; border: 2px solid var(--color-border-strong); background: var(--color-surface); box-shadow: var(--shadow-sm); }
    .lab-cue h2 { font-family: var(--font-display); font-size: 1.25rem; text-transform: uppercase; }
    .lab-cue p { color: var(--color-text-muted); font-size: .9rem; }
    .lab-row { display: flex; flex-wrap: wrap; align-items: center; gap: 1rem 1.5rem; }
    .lab-slider { display: flex; align-items: center; gap: .5rem; }
    .lab-slider label { font-family: var(--font-display); font-size: .9rem; min-width: 4rem; }
    .lab-slider output { font-variant-numeric: tabular-nums; min-width: 2.5rem; }
    .lab button { min-height: 44px; padding: .5rem 1rem; border: 2px solid var(--color-border-strong); background: var(--color-accent); color: var(--color-on-accent); font-family: var(--font-display); text-transform: uppercase; box-shadow: var(--shadow-sm); cursor: pointer; }
    .lab button.secondary { background: var(--color-surface); color: var(--color-text); }
    .lab button:active { translate: 2px 2px; box-shadow: none; }
    .lab-settings { width: 100%; padding: .75rem; border: 2px solid var(--color-border-strong); background: var(--color-surface); color: var(--color-text); font-family: var(--font-mono); font-size: .85rem; }
  `
  document.head.append(style)

  const cueBlocks = names.map((name) => {
    const play = element('button', { type: 'button', textContent: `Play ${name}` })
    play.addEventListener('click', () => playNotes(tuned(name), volume))
    return element(
      'section',
      { className: 'lab-cue' },
      element('h2', {}, name),
      element('p', {}, descriptions[name]),
      element(
        'div',
        { className: 'lab-row' },
        play,
        slider('Pitch', 0.5, 2, 0.05, 1, (value) => (tuning[name].pitch = value)),
        slider('Length', 0.5, 2, 0.05, 1, (value) => (tuning[name].length = value)),
      ),
    )
  })

  const playAll = element('button', { type: 'button', className: 'secondary', textContent: 'Play all in order' })
  playAll.addEventListener('click', () => {
    names.forEach((name, index) => window.setTimeout(() => playNotes(tuned(name), volume), index * 700))
  })

  const copy = element('button', { type: 'button', className: 'secondary', textContent: 'Copy settings' })
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(settings.value)
      copy.textContent = 'Copied'
    } catch {
      settings.select()
      copy.textContent = 'Select and copy manually'
    }
    window.setTimeout(() => (copy.textContent = 'Copy settings'), 1500)
  })

  renderSettings()
  root.append(
    element(
      'main',
      { className: 'lab' },
      element('h1', {}, 'Sound lab'),
      element(
        'p',
        { className: 'lab-note' },
        'Local only. Play each cue, adjust it, then copy the settings and paste them back. ',
        'Pitch multiplies every note’s frequency; Length stretches the timing. The site’s sounds stay unchanged until the settings are applied in src/lib/sound.ts.',
      ),
      element(
        'div',
        { className: 'lab-row' },
        slider('Volume', 0, 0.15, 0.005, volume, (value) => (volume = value)),
        playAll,
      ),
      ...cueBlocks,
      element('h2', {}, 'Settings to paste back'),
      settings,
      element('div', { className: 'lab-row' }, copy),
    ),
  )
}
