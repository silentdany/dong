'use client'

import { useEffect, useState } from 'react'
import { copy } from '@config/copy'
import { theme } from '@config/theme'
import { lengthCm } from '@/lib/ranking'

type Props = {
  scoreCents: number
  /** #1's score. Every bar is drawn as a fraction of it, so #1 is always full. */
  maxScoreCents: number
  rank?: number
}

/**
 * The only visual representation of a score in the app. Abstract on purpose:
 * a track, a fill sized by score / #1, one character at the leading edge, and
 * the length figure. Pure CSS, no images. Reskin via theme.meter.
 */
export default function RankMeter({ scoreCents, maxScoreCents, rank }: Props) {
  const { cap, minPx, maxPx, heightPx, topHeightPx, topRanks, valuePx, topValuePx, growMs } = theme.meter

  const ratio = maxScoreCents > 0 ? Math.min(1, Math.max(0, scoreCents / maxScoreCents)) : 0
  const isTop = rank !== undefined && rank <= topRanks
  const height = isTop ? topHeightPx : heightPx
  const label = copy.unitLabel(lengthCm(scoreCents))

  // Mount at zero and grow on the next frame, so the bar animates on first
  // paint as well as whenever the score changes.
  const [grown, setGrown] = useState(false)
  useEffect(() => {
    const frame = requestAnimationFrame(() => setGrown(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  const width = grown ? `${ratio * 100}%` : '0%'
  const transition = `width ${growMs}ms cubic-bezier(0.2, 0.8, 0.2, 1), left ${growMs}ms cubic-bezier(0.2, 0.8, 0.2, 1)`

  // #1 has nowhere left to point, and a cap hanging off a full bar would sit
  // outside the row. Everyone else keeps it, clamped inside the track.
  const capFontPx = Math.round(height * 0.8)
  const capRoom = capFontPx + 6
  const showCap = Boolean(cap) && ratio < 1
  const capLeft = grown
    ? `min(calc(100% - ${capRoom}px), max(${minPx}px, ${ratio * 100}%))`
    : '0px'

  return (
    <div className="w-full" style={maxPx > 0 ? { maxWidth: maxPx } : undefined}>
      <div
        className="relative w-full rounded-full"
        style={{ height, background: 'var(--l-track)' }}
        role="img"
        aria-label={label}
      >
        <div
          className="h-full rounded-full"
          style={{
            width,
            minWidth: grown ? minPx : 0,
            background: 'var(--l-fill)',
            transition,
          }}
        />
        {showCap ? (
          <span
            aria-hidden
            className="pointer-events-none absolute top-1/2 -translate-y-1/2 select-none leading-none"
            style={{
              left: capLeft,
              marginLeft: 4,
              fontSize: capFontPx,
              color: 'var(--l-fill)',
              transition,
            }}
          >
            {cap}
          </span>
        ) : null}
      </div>

      <p
        className="mt-1 font-bold tabular-nums leading-none"
        style={{ fontSize: isTop ? topValuePx : valuePx }}
      >
        {label}
      </p>
    </div>
  )
}
