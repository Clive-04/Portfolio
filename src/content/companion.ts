/**
 * What the pixel companion says and does in each section, keyed by the
 * section name on its anchors (`data-companion-anchor`). The line plays when
 * he first arrives; the action plays once he stands still on an anchor and
 * scrolling has paused. Keep lines short (one line, about 30 characters) so
 * the bubble fits beside the content without covering it.
 */
export const companionLines: Record<string, string> = {
  start: 'Hi, I’m Clive! Scroll with me.',
  about: 'First, a little about me.',
  projects: 'Here’s what I’ve built.',
  skills: 'These are the tools I use.',
  resume: 'My studies, in brief.',
  certifications: 'Each one links to its proof.',
  contact: 'Let’s work together!',
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
