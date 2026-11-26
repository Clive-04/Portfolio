/**
 * What the pixel companion says and does in each section, keyed by the
 * section name on its anchors (`data-companion-anchor`). The line plays when
 * he stops on its first card; the action plays once scrolling has paused.
 * He speaks to the visitor as a guide to the portfolio. Keep each line to
 * about two short lines (50 characters or fewer) so the bubble can sit
 * beside him without covering content.
 */
export const companionLines: Record<string, string> = {
  start: 'Hi, I’m Clive! Let me show you around.',
  about: 'First, a bit about me and what I’m after.',
  projects: 'Here’s what I’ve built. Open one for the story!',
  skills: 'My toolkit. Pick a category to see it used.',
  resume: 'My studies so far. The PDF is right here.',
  certifications: 'Every badge links to its proof. Go check!',
  contact: 'That’s the tour! Say hi anytime.',
}

/**
 * Section actions (clip names from the sprite sheet), played in order. They
 * run only on anchors marked `data-companion-act` (the cards they belong
 * to), so section headings stay simple waypoints. At the start he
 * straightens his tie and then waves.
 */
export const companionActions: Record<string, string[]> = {
  start: ['settle', 'wave'],
  about: ['sit'],
  projects: ['inspect'],
  skills: ['pouch'],
  resume: ['document'],
  certifications: ['polish'],
  // Contact: face the Email button, press it (its pressed look only), step back, wave, then teleport to the brand slot.
  contact: ['goodbye'],
}
