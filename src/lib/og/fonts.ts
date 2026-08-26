import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Satori embeds fonts, it does not fall back to the system. The three faces
 * below are the whole card typography: Instrument Serif for the figures,
 * IBM Plex Sans for everything else. They ship in the repo (and are pinned in
 * `next.config.ts` output tracing) so rendering a card never touches network.
 */

const DIR = join(process.cwd(), 'src', 'app', 'og', 'fonts')

export const SANS = 'IBM Plex Sans'
export const SERIF = 'Instrument Serif'

type Font = { name: string; data: Buffer; weight: 400 | 600 | 700; style: 'normal' }

let cached: Font[] | null = null

export function ogFonts(): Font[] {
  if (cached) return cached
  cached = [
    { name: SANS, data: readFileSync(join(DIR, 'IBMPlexSans-SemiBold.ttf')), weight: 600, style: 'normal' },
    { name: SANS, data: readFileSync(join(DIR, 'IBMPlexSans-Bold.ttf')), weight: 700, style: 'normal' },
    { name: SERIF, data: readFileSync(join(DIR, 'InstrumentSerif-Regular.ttf')), weight: 400, style: 'normal' },
  ]
  return cached
}
