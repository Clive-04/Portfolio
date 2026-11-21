import type { Certification } from './types'

/** Public Credly badge page; anyone can open it to verify the badge. */
const credly = (badgeId: string) => `https://www.credly.com/badges/${badgeId}/public_url`

export const credlyProfile = 'https://www.credly.com/users/clive-owen-benito/badges'

/**
 * Details come from the owner's public Credly profile and certificate documents
 * (checked against Credly on 2026-11-22). Cisco Networking Academy entries are course badges,
 * not Cisco exam certifications, and are labelled that way on the site.
 * Set `published: false` to hide an entry.
 */
export const certifications: Certification[] = [
  {
    name: 'Cisco Certified Support Technician (CCST) Networking',
    verificationUrl: credly('bd7c6120-fa9a-47ab-b367-327c216dffd1'),
    issuer: 'Cisco',
    issuerMark: 'Cisco',
    kind: 'certification',
    issued: '2025-02-10',
    skills: ['Network fundamentals', 'IP addressing', 'Troubleshooting'],
    published: true,
  },
  {
    name: 'IT Specialist – Python',
    verificationUrl: credly('5e4510fd-fadb-4ab5-9a49-f717d9ec87c7'),
    issuer: 'Certiport (Pearson VUE)',
    issuerMark: 'IT',
    kind: 'certification',
    issued: '2025-02-16',
    skills: ['Python fundamentals', 'Data types and control flow', 'Error handling'],
    published: true,
  },
  {
    name: 'IT Specialist – Databases',
    issuer: 'Certiport (Pearson VUE)',
    issuerMark: 'IT',
    kind: 'certification',
    issued: '2024-11-29',
    credentialId: 'wbzWe-H94A',
    verificationUrl: 'https://verify.certiport.com',
    skills: ['Relational database design', 'SQL queries', 'Data integrity'],
    published: true,
  },
  {
    name: 'PMI Project Management Ready',
    verificationUrl: credly('ee568e26-980d-4921-8366-cd714a79ef1c'),
    issuer: 'Project Management Institute',
    issuerMark: 'PMI',
    kind: 'certification',
    issued: '2026-03-16',
    expires: '2031-03-17',
    skills: ['Project management fundamentals', 'Agile and predictive approaches'],
    published: true,
  },
  {
    name: 'CyberOps Associate',
    verificationUrl: credly('86b7ea11-c9ab-454a-acff-2e188c64a0e7'),
    issuer: 'Cisco Networking Academy',
    issuerMark: 'Net',
    kind: 'course-badge',
    issued: '2026-11-21',
    skills: ['Security monitoring', 'Threat analysis'],
    published: true,
  },
  {
    name: 'DevNet Associate',
    verificationUrl: credly('d0b1bc92-bb93-41f4-be4e-fb7954be4781'),
    issuer: 'Cisco Networking Academy',
    issuerMark: 'Net',
    kind: 'course-badge',
    issued: '2026-04-17',
    skills: ['APIs and automation', 'Software development for networks'],
    published: true,
  },
  {
    name: 'CCNA: Enterprise Networking, Security, and Automation',
    verificationUrl: credly('7e63f120-901d-4c66-8665-8731e373d23e'),
    issuer: 'Cisco Networking Academy',
    issuerMark: 'Net',
    kind: 'course-badge',
    issued: '2026-01-12',
    skills: ['WAN and network security', 'Network automation'],
    published: true,
  },
  {
    name: 'CCNA: Switching, Routing, and Wireless Essentials',
    verificationUrl: credly('1e3ea104-9ad2-400b-ba35-e9d2af9e53e0'),
    issuer: 'Cisco Networking Academy',
    issuerMark: 'Net',
    kind: 'course-badge',
    issued: '2025-03-27',
    skills: ['Switching and VLANs', 'Routing', 'Wireless LANs'],
    published: true,
  },
  {
    name: 'CCNA: Introduction to Networks',
    verificationUrl: credly('27604b73-062b-4ef0-b879-e7bf12260697'),
    issuer: 'Cisco Networking Academy',
    issuerMark: 'Net',
    kind: 'course-badge',
    issued: '2025-02-07',
    skills: ['Network fundamentals', 'Ethernet and IP'],
    published: true,
  },
]
