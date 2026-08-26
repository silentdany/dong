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

export default function RankMeter({ scoreCents, maxScoreCents, rank }: Props) {
  const { cap, minPx, maxPx, heightPx, topHeightPx, topRanks, valuePx, topValuePx, growMs } = theme.meter

  const ratio = maxScoreCents > 0 ? Math.min(1, Math.max(0, scoreCents / maxScoreCents)) : 0
  const isTop = rank !== undefined && rank <= topRanks
  const height = isTop ? topHeightPx : heightPx
  const label = copy.unitLabel(lengthCm(scoreCents))

  const [grown, setGrown] = useState(false)
  useEffect(() => {
    const frame = requestAnimationFrame(() => setGrown(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  const width = grown ? `${Math.max(ratio * 100, 6)}%` : '0%'
  const transition = `width ${growMs}ms cubic-bezier(0.22, 1, 0.36, 1)`

  return (
    <div className="w-full" style={maxPx > 0 ? { maxWidth: maxPx } : undefined}>
      <p
        className="font-display tracking-tight tabular-nums"
        style={{ fontSize: isTop ? topValuePx : valuePx, lineHeight: 1 }}
      >
        {label}
      </p>
      <div className="relative mt-3 w-full pr-8">
        <div
          className="relative w-full overflow-visible rounded-full"
          style={{ height, background: 'var(--l-track)' }}
          role="img"
          aria-label={label}
        >
          <div
            className="absolute top-0 left-0 h-full rounded-full"
            style={{
              width,
              minWidth: grown ? minPx : 0,
              background: 'var(--l-fill)',
              transition,
            }}
          >
            {cap ? (
              <span
                aria-hidden
                className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-[70%] select-none leading-none"
                style={{ fontSize: isTop ? 28 : 20 }}
              >
                {cap}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
