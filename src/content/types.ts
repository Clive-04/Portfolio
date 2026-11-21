/**
 * Content types. Portfolio facts live in typed records, separate from
 * the components that display them, so updating a project never means
 * editing layout code.
 */

/** How well a claim is backed by repository evidence. */
export type EvidenceLevel = 'confirmed' | 'qualified'

export type ProjectStatus = 'completed' | 'in-progress' | 'planned'

export interface Technology {
  name: string
  /** `qualified` = present in the project but not a core part of the owner's work. */
  evidence: EvidenceLevel
}

export interface ProjectLinks {
  repository?: string
  /** An older repository that holds the original commit history. */
  history?: string
  live?: string
}

export interface Screenshot {
  src: string
  alt: string
  width: number
  height: number
}

export interface Project {
  slug: string
  title: string
  summary: string
  /** A few words shown on the collapsed card, e.g. "Solo project". */
  teamLabel: string
  problem: string
  role: string
  collaboration: string
  status: ProjectStatus
  featured: boolean
  stack: Technology[]
  features: string[]
  validation: string[]
  links: ProjectLinks
  screenshots: Screenshot[]
  limitations: string[]
}

/**
 * `certification`: an exam-based credential.
 * `course-badge`: a verified badge for completing a course, not an exam certification.
 */
export type CredentialKind = 'certification' | 'course-badge'

export interface Certification {
  name: string
  issuer: string
  /** Short mark shown in the issuer seal, e.g. "PMI". */
  issuerMark: string
  kind: CredentialKind
  /** ISO date, e.g. `2026-05-01`. Omit if the issuer does not show one. */
  issued?: string
  expires?: string
  credentialId?: string
  verificationUrl?: string
  skills: string[]
  /** Public path to a redacted certificate image or PDF. */
  asset?: string
  /** Only published entries are shown on the site. */
  published: boolean
}

export interface Skill {
  name: string
  /** Project slugs whose repositories show this skill. Titles come from projects.ts. */
  projects: string[]
}

export interface SkillGroup {
  title: string
  /** One short line describing the category. */
  blurb: string
  skills: Skill[]
}

export interface ProfileLink {
  label: string
  /** Leave undefined until the link is ready to publish. */
  href?: string
}

export interface Profile {
  name: string
  shortName: string
  photo?: Screenshot
  title: string
  headline: string
  about: string[]
  /** One line for the highlighted "Looking for" tile. */
  lookingFor: string
  /** Short focus areas shown as tags. */
  focus: string[]
  education: { school: string; program: string; years: string }
  affiliations: string[]
  /** Split so the full address never appears as one string in the page source. */
  email?: { user: string; domain: string }
  links: {
    github: ProfileLink
    linkedin: ProfileLink
    resume: ProfileLink
  }
}
