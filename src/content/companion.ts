/**
 * What the pixel companion says, keyed by the `data-companion-ledge` name of
 * where he stands. Cards and blocks are named after their section, so each
 * line plays once, wherever he first lands in that section. Keep lines short
 * (one line, about 30 characters) so the bubble fits beside the content
 * without covering it. A name with no entry here gets no bubble.
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
