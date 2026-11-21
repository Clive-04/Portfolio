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
}

export interface Project {
  slug: string
  title: string
  summary: string
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

export interface Certification {
  name: string
  issuer: string
  /** ISO date, e.g. `2026-05-01`. */
  issued: string
  expires?: string
  credentialId?: string
  verificationUrl?: string
  skills: string[]
  /** Public path to a redacted certificate image or PDF. */
  asset?: string
  /** Only published entries are shown on the site. */
  published: boolean
}

export interface ProfileLink {
  label: string
  /** Leave undefined until the link is ready to publish. */
  href?: string
}

export interface Profile {
  name: string
  headline: string
  supportingLine: string
  targetRoles: string[]
  links: {
    github: ProfileLink
    linkedin: ProfileLink
    email: ProfileLink
    resume: ProfileLink
  }
}
