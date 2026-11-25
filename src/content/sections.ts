/**
 * Page sections in order. The navigation and the page both read this list.
 *
 * `motif` is the approved pixel-design vocabulary, shown as a small label
 * above the standard heading in the pixel design only. Headings stay plain
 * ("Skills"), so recruiters and screen readers never have to decode it.
 */
export const sections = [
  { id: 'about', label: 'About', motif: 'Adventurer card' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills', motif: 'Inventory' },
  { id: 'resume', label: 'Résumé', motif: 'Save file' },
  { id: 'certifications', label: 'Certifications', motif: 'Emblem case' },
  { id: 'contact', label: 'Contact' },
] as const

export type SectionId = (typeof sections)[number]['id']

/** The motif label for a section, if it has one. */
export function sectionMotif(id: SectionId): string | undefined {
  const section = sections.find((item) => item.id === id)
  return section && 'motif' in section ? section.motif : undefined
}
