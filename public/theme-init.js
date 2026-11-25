/*
 * Applies the saved design mode and color theme to <html> before the page
 * paints, so a returning visitor never sees a flash of the wrong theme.
 *
 * It is a separate file, not an inline <script>, because the Content Security
 * Policy only allows scripts from the site itself (script-src 'self').
 * Keep the keys and values in sync with src/lib/preferences.ts (a test checks this).
 */
;(function () {
  var root = document.documentElement
  var design = null
  var theme = null
  try {
    design = localStorage.getItem('portfolio:design')
    theme = localStorage.getItem('portfolio:color-theme')
  } catch {
    // Storage blocked: use the defaults below.
  }
  if (design !== 'classic' && design !== 'pixel') design = 'classic'
  if (theme !== 'day' && theme !== 'night') {
    theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day'
  }
  root.setAttribute('data-design', design)
  root.setAttribute('data-color-theme', theme)
})()
