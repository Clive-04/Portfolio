/**
 * Interface sound effects for the pixel design.
 *
 * Every cue is synthesised here with the Web Audio API: short square- and
 * triangle-wave notes written for this site. Nothing is sampled from a game
 * or a sound library, and there are no audio files to download.
 *
 * Sound is off by default and never autoplays. `playSound` does nothing until
 * `setSoundEnabled(true)` (the visitor turned sound on in the pixel design),
 * and the AudioContext is only created by the first sound after that, which
 * always follows a click or key press.
 */

export type SoundName = 'navigate' | 'confirm' | 'back' | 'open' | 'download' | 'external' | 'tab' | 'page'

export interface Note {
  /** Frequency in hertz. */
  freq: number
  /** Optional end frequency: the note slides from `freq` to `to` over its length. */
  to?: number
  /** Start time in seconds after the cue begins. */
  at: number
  /** Length in seconds. */
  dur: number
  wave: 'square' | 'triangle'
}

/** Each action gets its own short, distinct cue. */
export const cues: Record<SoundName, readonly Note[]> = {
  // A single short tick when jumping to a section.
  navigate: [{ freq: 880, at: 0, dur: 0.035, wave: 'square' }],
  // Rising fourth: a choice was accepted.
  confirm: [
    { freq: 587.33, at: 0, dur: 0.05, wave: 'square' },
    { freq: 783.99, at: 0.055, dur: 0.07, wave: 'square' },
  ],
  // Falling fourth, softer wave: back or close.
  back: [
    { freq: 659.25, at: 0, dur: 0.05, wave: 'triangle' },
    { freq: 493.88, at: 0.055, dur: 0.08, wave: 'triangle' },
  ],
  // Quick three-note lift: a dialog opens.
  open: [
    { freq: 392, at: 0, dur: 0.04, wave: 'square' },
    { freq: 523.25, at: 0.045, dur: 0.04, wave: 'square' },
    { freq: 698.46, at: 0.09, dur: 0.07, wave: 'square' },
  ],
  // Four-note climb that lands an octave up: a download started.
  download: [
    { freq: 523.25, at: 0, dur: 0.05, wave: 'square' },
    { freq: 659.25, at: 0.06, dur: 0.05, wave: 'square' },
    { freq: 783.99, at: 0.12, dur: 0.05, wave: 'square' },
    { freq: 1046.5, at: 0.18, dur: 0.12, wave: 'triangle' },
  ],
  // Upward sweep with a small sparkle: a link opens in another browser tab.
  external: [
    { freq: 392, to: 1046.5, at: 0, dur: 0.09, wave: 'square' },
    { freq: 1567.98, at: 0.1, dur: 0.06, wave: 'triangle' },
  ],
  // One soft, round note that dips: switching a skill pocket.
  tab: [{ freq: 740, to: 494, at: 0, dur: 0.07, wave: 'triangle' }],
  // Quick double tick on one pitch: turning to the previous or next case study.
  page: [
    { freq: 440, at: 0, dur: 0.025, wave: 'square' },
    { freq: 440, at: 0.045, dur: 0.025, wave: 'square' },
  ],
}

/** Quiet on purpose: interface sounds should sit well under speech and music. */
export const VOLUME = 0.05

let enabled = false
let context: AudioContext | null = null

export function setSoundEnabled(on: boolean) {
  enabled = on
}

export function isSoundEnabled() {
  return enabled
}

/** Plays a named cue, but only after the visitor turned sound on. */
export function playSound(name: SoundName) {
  if (!enabled) return
  playNotes(cues[name])
}

/**
 * Plays notes directly, without the "sound is on" check. Only for the
 * local sound lab (sound-lab.html), which is never part of the built site;
 * the site itself always goes through `playSound`.
 */
export function playNotes(notes: readonly Note[], volume = VOLUME) {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return
  try {
    context ??= new AudioContext()
    if (context.state === 'suspended') void context.resume()
    const start = context.currentTime + 0.005
    const master = context.createGain()
    master.gain.value = volume
    master.connect(context.destination)

    for (const note of notes) {
      const osc = context.createOscillator()
      const env = context.createGain()
      const t = start + note.at
      osc.type = note.wave
      osc.frequency.setValueAtTime(note.freq, t)
      if (note.to) osc.frequency.exponentialRampToValueAtTime(note.to, t + note.dur)
      // A tiny attack and a fast decay avoid clicks at the start and end of each note.
      env.gain.setValueAtTime(0, t)
      env.gain.linearRampToValueAtTime(1, t + 0.005)
      env.gain.exponentialRampToValueAtTime(0.001, t + note.dur)
      osc.connect(env).connect(master)
      osc.start(t)
      osc.stop(t + note.dur + 0.02)
    }
  } catch {
    // Audio is a nice-to-have; never let it break an interaction.
  }
}
