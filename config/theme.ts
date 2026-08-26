/**
 * The entire visual skin. Components read tokens from here (via CSS variables
 * emitted by <ThemeStyle />) and never hardcode a colour. See RESKIN.md.
 */

export const theme = {
  colors: {
    bg: '#110c12',
    ink: '#f4eef2',
    muted: '#a8949c',
    accent: '#f0e6ea',
    accentInk: '#110c12',
    track: '#2e242e',
    fill: '#8a3d9b',
    danger: '#c45c4a',
    card: '#1c151c',
  },

  radius: '12px',

  font: "IBM Plex Sans, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
  displayFont: "Instrument Serif, Iowan Old Style, Palatino, Georgia, serif",

  meter: {
    /** Drawn at the leading edge of the fill. Any character. '' to disable. */
    cap: '🍆',
    /** Smallest visible fill, so a $5 listing is still a mark and not nothing. */
    minPx: 18,
    /** Track width cap in px. 0 means no cap: the track fills the row. */
    maxPx: 0,
    /** Bar height, and the taller one used for the top ranks. */
    heightPx: 16,
    topHeightPx: 28,
    /** How many ranks get the tall bar and the big number. */
    topRanks: 1,
    /** Font size of the length figure, and the big one for the top ranks. */
    valuePx: 22,
    topValuePx: 56,
    /** Fill growth animation. */
    growMs: 420,
  },

  /** Thresholds are cents, ascending. The highest one reached wins. */
  badges: [
    { minCents: 0, label: 'pretending' },
    { minCents: 500, label: 'costume' },
    { minCents: 2000, label: 'screenshot' },
    { minCents: 5000, label: 'warming up' },
    { minCents: 10000, label: 'public' },
    { minCents: 25000, label: 'honest' },
    { minCents: 100000, label: 'committed' },
    { minCents: 250000, label: 'unwell' },
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
  entries.push(`--l-display-font: ${theme.displayFont};`)
  return `:root{${entries.join('')}}`
}
