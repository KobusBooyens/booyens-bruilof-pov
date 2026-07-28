/**
 * Topographic contour lines — a nod to the Magaliesberge, used as a faint
 * signature motif behind the hero and as a section divider. Purely decorative.
 */
export function Contours({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1200 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <g stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.9">
        <path d="M0 210 C 180 160, 320 250, 500 190 S 820 120, 1000 180 S 1120 210, 1200 150" />
        <path d="M0 170 C 200 120, 360 210, 540 150 S 860 80, 1040 140 S 1150 170, 1200 110" />
        <path d="M0 130 C 220 90, 380 170, 560 120 S 880 50, 1080 100 S 1160 125, 1200 80" />
        <path d="M0 92 C 240 60, 400 130, 600 90 S 900 30, 1120 70 S 1170 90, 1200 55" />
        <path d="M0 56 C 260 34, 420 96, 640 60 S 940 18, 1160 46 S 1185 55, 1200 36" />
      </g>
    </svg>
  );
}

/** A single ridgeline used as a thin divider between sections. */
export function Ridge({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1200 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path
        d="M0 30 C 200 6, 360 34, 560 18 S 900 2, 1120 22 S 1170 30, 1200 16"
        stroke="currentColor"
        strokeWidth="1.4"
        fill="none"
      />
    </svg>
  );
}
