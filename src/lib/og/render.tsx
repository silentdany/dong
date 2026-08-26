import { ImageResponse } from 'next/og'
import { CARD } from './parts'
import { ogFonts } from './fonts'

/**
 * Every card is a pure function of its query string, so the URL is the cache
 * key: a board that changes ships a new URL and scrapers re-fetch instead of
 * serving a stale image forever.
 */
export function card(element: React.ReactElement): Response {
  return new ImageResponse(element, {
    width: CARD.width,
    height: CARD.height,
    fonts: ogFonts(),
    headers: { 'cache-control': 'public, max-age=31536000, s-maxage=31536000, immutable, no-transform' },
  })
}

export function n(params: URLSearchParams, key: string, fallback = 0): number {
  const raw = params.get(key)
  if (raw === null || raw.trim() === '') return fallback
  const value = Number(raw)
  return Number.isFinite(value) ? value : fallback
}

export function s(params: URLSearchParams, key: string, fallback = ''): string {
  return params.get(key)?.trim() || fallback
}

/** 0..1, used for every bar width. */
export function ratio(part: number, whole: number): number {
  if (whole <= 0) return part > 0 ? 1 : 0
  return Math.min(1, Math.max(0, part / whole))
}
