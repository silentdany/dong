/**
 * The entire visual skin. Components read tokens from here (via CSS variables
 * emitted by <ThemeStyle />) and never hardcode a colour. See RESKIN.md.
 */

export const theme = {
  colors: {
    bg: '#0c0a0e',
    ink: '#f4f0f8',
    muted: '#8a8299',
    accent: '#ff2d6a',
    accentInk: '#0c0a0e',
    track: '#1c1824',
    fill: '#ff2d6a',
    danger: '#ff5c7a',
    card: '#15121c',
  },

  radius: '6px',

  font: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",

  meter: {
    /** Drawn at the leading edge of the fill. Any character. '' to disable. */
    cap: '›',
    /** Smallest visible fill, so a $5 listing is still a mark and not nothing. */
    minPx: 16,
    /** Track width cap in px. 0 means no cap: the track fills the row. */
    maxPx: 0,
    /** Bar height, and the taller one used for the top ranks. */
    heightPx: 12,
    topHeightPx: 26,
    /** How many ranks get the tall bar and the big number. */
    topRanks: 3,
    /** Font size of the length figure, and the big one for the top ranks. */
    valuePx: 15,
    topValuePx: 32,
    /** Fill growth animation. */
    growMs: 500,
  },

  /** Thresholds are cents, ascending. The highest one reached wins. */
  badges: [
    { minCents: 0, label: 'tiny' },
    { minCents: 500, label: 'warming up' },
    { minCents: 2000, label: 'serious' },
    { minCents: 10000, label: 'compensating' },
    { minCents: 50000, label: 'unwell' },
  ],
} as const

export type Theme = typeof theme

/** Highest badge whose threshold the score has reached. */
export function badgeFor(scoreCents: number): string {
  let label: string = theme.badges[0].label
  for (const badge of theme.badges) {
    if (scoreCents >= badge.minCents) label = badge.label
  }
  return label
}

/** Token -> CSS custom property. The single bridge between theme.ts and CSS. */
export function themeCssVars(): string {
  const entries: string[] = []
  for (const [name, value] of Object.entries(theme.colors)) {
    entries.push(`--l-${name}: ${value};`)
  }
  entries.push(`--l-radius: ${theme.radius};`)
  entries.push(`--l-font: ${theme.font};`)
  return `:root{${entries.join('')}}`
}
