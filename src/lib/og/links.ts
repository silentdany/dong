import type { Metadata } from 'next'
import { copy } from '@config/copy'

/**
 * Every share card URL the app can point at, built in one place.
 *
 * The cards take their whole state from the query string, which means the URL
 * is the cache key: when the board moves, the OG URL changes and scrapers
 * re-fetch instead of serving last week's leader forever.
 */

type Value = string | number | undefined

function query(base: string, params: Record<string, Value>, repeated: [string, string][] = []): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '' || value === 0) continue
    search.set(key, String(value))
  }
  for (const [key, value] of repeated) search.append(key, value)
  const qs = search.toString()
  return qs ? `${base}?${qs}` : base
}

/** `~` separates the fields inside a board row, so it cannot survive in one. */
function field(text: string): string {
  return text.replace(/~/g, '-').trim()
}

export type Side = { name: string; cm: number; target?: string }

export const ogSite = (): string => '/og'

export const ogText = (input: { tag?: string; title: string; sub?: string }): string =>
  query('/og/text', { tag: input.tag, title: input.title, sub: input.sub })

export const ogListing = (input: {
  name: string
  target?: string
  cm: number
  rank?: number
  /** Share of #1, 0..1. The bar is drawn against the leader, like the board. */
  ratio?: number
  badge?: string
  desc?: string
  takeTop?: number
}): string =>
  query('/og/listing', {
    name: input.name,
    target: input.target,
    cm: input.cm,
    rank: input.rank,
    ratio: input.ratio === undefined ? undefined : Number(input.ratio.toFixed(4)),
    badge: input.badge,
    desc: input.desc,
    takeTop: input.takeTop,
  })

export const ogBoard = (input: {
  kind: 'today' | 'all-time'
  /** Already in rank order. Only the first four fit the card. */
  rows: Side[]
  takeTop?: number
}): string =>
  query(
    '/og/board',
    { kind: input.kind, takeTop: input.takeTop },
    input.rows.slice(0, 4).map((row) => ['r', [field(row.name), row.cm, field(row.target ?? '')].join('~')]),
  )

export const ogDuel = (input: { a: Side; b: Side; flip?: number; tag?: string }): string =>
  query('/og/duel', {
    a: input.a.name,
    acm: input.a.cm,
    ah: input.a.target,
    b: input.b.name,
    bcm: input.b.cm,
    bh: input.b.target,
    flip: input.flip,
    tag: input.tag,
  })

/** The `images` entry Next wants: size and alt text included, not just a URL. */
export function ogImage(url: string, alt: string) {
  return { url, width: 1200, height: 630, alt }
}

export const ogAlt = copy.og.alt

/**
 * The metadata block for a page whose card is pure typography: /rules, /about,
 * /success, /cancel. Same shape every time, so the pages stay one line each.
 */
export function textCardMetadata(input: {
  tag?: string
  title: string
  sub?: string
  description?: string
}): Metadata {
  const description = input.description ?? input.sub ?? copy.ogDescription
  const images = [ogImage(ogText(input), copy.og.alt.text(input.title))]
  return {
    title: input.title,
    description,
    openGraph: { title: input.title, description, images },
    twitter: { card: 'summary_large_image', title: input.title, description, images },
  }
}

/**
 * Everything a duel page needs for its share card, in one call:
 *
 *   export const generateMetadata = async ({ params }) =>
 *     duelMetadata({ a: { name, cm, target }, b: { name, cm, target } })
 *
 * The longer side wins on the card regardless of which slot it is in, so the
 * caller does not have to sort, and `flip` defaults to the board's own rule
 * for passing the leader.
 */
export function duelMetadata(input: { a: Side; b: Side; flip?: number; tag?: string }): Metadata {
  const [top, low] = input.a.cm >= input.b.cm ? [input.a, input.b] : [input.b, input.a]
  const title = copy.duel.shareTitle(top.name, low.name)
  const description = copy.ogDescription
  const images = [ogImage(ogDuel(input), copy.og.alt.duel(top.name, low.name))]
  return {
    title: copy.duel.title(top.name, low.name),
    description,
    openGraph: { title, description, images },
    twitter: { card: 'summary_large_image', title, description, images },
  }
}
