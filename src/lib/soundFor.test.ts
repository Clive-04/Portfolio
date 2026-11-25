import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { soundFor } from './soundFor.ts'

describe('soundFor', () => {
  it('plays navigate for section links', () => {
    assert.equal(soundFor({ tag: 'a', href: '#skills' }), 'navigate')
  })

  it('plays download for the résumé link', () => {
    assert.equal(soundFor({ tag: 'a', href: '/Clive-Owen-Benito-Resume.pdf', download: true }), 'download')
  })

  it('plays external for links that open another browser tab (LinkedIn, GitHub, Verify, Credly, Live, Code)', () => {
    assert.equal(soundFor({ tag: 'a', href: 'https://www.credly.com/x', newTab: true }), 'external')
    assert.equal(soundFor({ tag: 'a', href: 'https://github.com/Clive-04', newTab: true }), 'external')
  })

  it('plays confirm for the email link and same-tab external links', () => {
    assert.equal(soundFor({ tag: 'a', href: 'mailto:someone@example.com' }), 'confirm')
    assert.equal(soundFor({ tag: 'a', href: 'https://github.com/Clive-04' }), 'confirm')
  })

  it('accepts the page cue through data-sound (case-study Previous/Next)', () => {
    assert.equal(soundFor({ tag: 'button', dataSound: 'page' }), 'page')
  })

  it('plays open or back for the phone menu button', () => {
    assert.equal(soundFor({ tag: 'button', expanded: 'false' }), 'open')
    assert.equal(soundFor({ tag: 'button', expanded: 'true' }), 'back')
  })

  it('honours data-sound, including "none"', () => {
    assert.equal(soundFor({ tag: 'button', dataSound: 'navigate' }), 'navigate')
    assert.equal(soundFor({ tag: 'a', href: '#top', dataSound: 'none' }), null)
  })

  it('stays silent for buttons that handle their own sound', () => {
    assert.equal(soundFor({ tag: 'button' }), null)
  })
})
