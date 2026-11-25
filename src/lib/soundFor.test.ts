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

  it('plays confirm for email and external links (Contact, Verify, Credly, Live, Code)', () => {
    assert.equal(soundFor({ tag: 'a', href: 'mailto:someone@example.com' }), 'confirm')
    assert.equal(soundFor({ tag: 'a', href: 'https://www.credly.com/x', newTab: true }), 'confirm')
    assert.equal(soundFor({ tag: 'a', href: 'https://github.com/Clive-04' }), 'confirm')
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
