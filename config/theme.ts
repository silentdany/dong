/**
 * The entire visual skin. Components read tokens from here (via CSS variables
 * emitted by <ThemeStyle />) and never hardcode a colour. See RESKIN.md.
 */

export const theme = {
  colors: {
    bg: '#f3ece1',
    ink: '#161311',
    muted: '#6d6357',
    accent: '#cf2233',
    accentInk: '#fdf9f3',
    track: '#e2d8c8',
    fill: '#cf2233',
    danger: '#9d1420',
    card: '#fbf7f0',
  },

  radius: '10px',

  font: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",

  meter: {
    /** Drawn at the leading edge of the fill. Any character. '' to disable. */
    cap: '»',
    /** Smallest visible fill, so a $5 listing is still a mark and not nothing. */
    minPx: 14,
    /** Track never grows past this, so #1 does not blow out the layout. */
    maxPx: 560,
    /** Fill growth animation. */
    growMs: 650,
  },

  /** Thresholds are cents, ascending. The highest one reached wins. */
  badges: [
    { minCents: 0, label: 'new' },
    { minCents: 500, label: 'warming up' },
    { minCents: 2000, label: 'serious' },
    { minCents: 10000, label: 'committed' },
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
  entries.push(`--l-meter-min: ${theme.meter.minPx}px;`)
  entries.push(`--l-meter-max: ${theme.meter.maxPx}px;`)
  entries.push(`--l-meter-grow: ${theme.meter.growMs}ms;`)
  return `:root{${entries.join('')}}`
}
