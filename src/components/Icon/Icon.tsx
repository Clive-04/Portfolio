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
