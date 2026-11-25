/**
 * What the pixel companion says when he reaches a ledge, keyed by the
 * ledge's `data-companion-ledge` name. He stands just above that place, so
 * each line introduces what comes next. Keep lines short (one line, about 30
 * characters) so the bubble fits beside the content without covering it.
 * A ledge with no entry here gets no bubble. The footer has none: he docks
 * in the sidebar at the bottom of the page before reaching it.
 */
export const companionLines: Record<string, string> = {
  start: 'Hi, I’m Clive! Scroll with me.',
  about: 'First, a little about me.',
  projects: 'Here’s what I’ve built.',
  project: 'Open a card for the full story.',
  skills: 'These are the tools I use.',
  resume: 'My studies, in brief.',
  certifications: 'Each one links to its proof.',
  contact: 'Let’s work together!',
}
