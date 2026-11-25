import { PIXEL_GRID, bitmaps, toPath, type PixelIconName } from './bitmaps'

// Built once when the module loads.
const paths = Object.fromEntries(
  Object.entries(bitmaps).map(([name, rows]) => [name, toPath(rows)]),
) as Record<PixelIconName, string>

interface PixelIconProps {
  name: PixelIconName
  /** Rendered size in CSS pixels; keep it a multiple of 16 so pixels stay square. */
  size?: 16 | 32 | 48
  className?: string
}

/** A crisp pixel icon in the current text color. Decorative: hidden from screen readers. */
export function PixelIcon({ name, size = 16, className }: PixelIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox={`0 0 ${PIXEL_GRID} ${PIXEL_GRID}`}
      shapeRendering="crispEdges"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[name]} />
    </svg>
  )
}
