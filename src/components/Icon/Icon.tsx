/**
 * Small inline SVG icons drawn with strokes at a 1.75 weight, so they match
 * the semibold button text. Decorative only: always hidden from screen readers.
 */
const paths = {
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
} as const

export type IconName = keyof typeof paths

interface IconProps {
  name: IconName
  className?: string
}

export function Icon({ name, className }: IconProps) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[name]} />
    </svg>
  )
}
