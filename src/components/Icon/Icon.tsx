/**
 * Small inline SVG icons. Line icons are drawn with strokes at a 1.75 weight
 * so they match the semibold button text; brand logos are filled shapes.
 * Decorative only: always hidden from screen readers.
 */
const lineIcons = {
  arrow: 'M5 12h14M13 6l6 6-6 6',
  external: 'M7 17 17 7M9 7h8v8',
  down: 'M12 5v14M6 13l6 6 6-6',
  mail: 'M4 6h16v12H4zM4 7l8 6 8-6',
  close: 'M6 6l12 12M18 6 6 18',
  expand: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  shield: 'M12 3l7 3v5.5c0 4.3-3 7.9-7 9.5-4-1.6-7-5.2-7-9.5V6zM9 12l2 2 4-4',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8h.01',
  prev: 'M15 6l-6 6 6 6',
  next: 'M9 6l6 6-6 6',
  lock: 'M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z',
  pause: 'M9 6v12M15 6v12',
  play: 'M8 5.5v13l10-6.5z',
  // Certification motifs (used as large card watermarks).
  network:
    'M12 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM5 22a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM19 22a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM12 7v5M12 12l-5.3 5.3M12 12l5.3 5.3M7.5 19.5h9',
  code: 'M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16',
  database:
    'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  timeline: 'M3 3v18h18M7 7h6M9 11h8M8 15h5M14 15h4',
} as const

/** Brand marks (GitHub Invertocat and the LinkedIn "in" logo), as filled 24×24 paths. */
const brandIcons = {
  github:
    'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
  linkedin:
    'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
} as const

export type IconName = keyof typeof lineIcons | keyof typeof brandIcons

interface IconProps {
  name: IconName
  className?: string
}

export function Icon({ name, className }: IconProps) {
  const common = {
    className,
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    'aria-hidden': true,
    focusable: false,
  } as const

  if (name in brandIcons) {
    return (
      <svg {...common} fill="currentColor">
        <path d={brandIcons[name as keyof typeof brandIcons]} />
      </svg>
    )
  }

  return (
    <svg
      {...common}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={lineIcons[name as keyof typeof lineIcons]} />
    </svg>
  )
}
