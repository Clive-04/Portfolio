import type { Certification } from './types'

/**
 * Details come from the owner's badge wallet and certificate documents
 * (checked 2026-11-22). Cisco Networking Academy entries are course badges,
 * not Cisco exam certifications, and are labelled that way on the site.
 * Set `published: false` to hide an entry.
 */
export const certifications: Certification[] = [
  {
    name: 'Cisco Certified Support Technician (CCST) Networking',
    issuer: 'Cisco',
    kind: 'certification',
    issued: '2025-02-10',
    skills: ['Network fundamentals', 'IP addressing', 'Troubleshooting'],
    published: true,
  },
  {
    name: 'IT Specialist – Python',
    issuer: 'Certiport (Pearson VUE)',
    kind: 'certification',
    issued: '2025-02-16',
    skills: ['Python fundamentals', 'Data types and control flow', 'Error handling'],
    published: true,
  },
  {
    name: 'IT Specialist – Databases',
    issuer: 'Certiport (Pearson VUE)',
    kind: 'certification',
    issued: '2024-11-29',
    credentialId: 'wbzWe-H94A',
    verificationUrl: 'https://verify.certiport.com',
    skills: ['Relational database design', 'SQL queries', 'Data integrity'],
    published: true,
  },
  {
    name: 'PMI Project Management Ready',
    issuer: 'Project Management Institute',
    kind: 'certification',
    expires: '2031-03-17',
    skills: ['Project management fundamentals', 'Agile and predictive approaches'],
    published: true,
  },
  {
    name: 'CyberOps Associate',
    issuer: 'Cisco Networking Academy',
    kind: 'course-badge',
    issued: '2026-11-21',
    skills: ['Security monitoring', 'Threat analysis'],
    published: true,
  },
  {
    name: 'DevNet Associate',
    issuer: 'Cisco Networking Academy',
    kind: 'course-badge',
    issued: '2026-04-17',
    skills: ['APIs and automation', 'Software development for networks'],
    published: true,
  },
  {
    name: 'CCNA: Enterprise Networking, Security, and Automation',
    issuer: 'Cisco Networking Academy',
    kind: 'course-badge',
    issued: '2026-01-12',
    skills: ['WAN and network security', 'Network automation'],
    published: true,
  },
  {
    name: 'CCNA: Switching, Routing, and Wireless Essentials',
    issuer: 'Cisco Networking Academy',
    kind: 'course-badge',
    issued: '2025-03-27',
    skills: ['Switching and VLANs', 'Routing', 'Wireless LANs'],
    published: true,
  },
  {
    name: 'CCNA: Introduction to Networks',
    issuer: 'Cisco Networking Academy',
    kind: 'course-badge',
    issued: '2025-02-07',
    skills: ['Network fundamentals', 'Ethernet and IP'],
    published: true,
  },
]
