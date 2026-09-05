interface SectionDividerProps {
  /** Tailwind fill class matching the NEXT section's background. */
  fill: string
  /** Mirror the wave for alternating seams. */
  flip?: boolean
  /** Background of the PREVIOUS section the divider sits on. */
  wrapperClassName?: string
}

/**
 * Decorative wave seam between two sections of different backgrounds.
 * Render it at the boundary: `wrapperClassName` carries the previous
 * section's background while `fill` paints the wave in the next
 * section's color.
 */
export function SectionDivider({ fill, flip = false, wrapperClassName = '' }: SectionDividerProps) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none leading-none ${wrapperClassName}`}
    >
      <svg
        data-name="section-divider"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className={`block h-12 w-full md:h-16 ${flip ? 'rotate-180' : ''} ${fill}`}
      >
        <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" />
      </svg>
    </div>
  )
}
