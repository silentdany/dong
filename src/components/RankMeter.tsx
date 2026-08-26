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
  const {
    prefix,
    tip,
    baseHalo,
    minPx,
    maxPx,
    heightPx,
    topHeightPx,
    topRanks,
    valuePx,
    topValuePx,
    growMs,
  } = theme.meter

  const ratio = maxScoreCents > 0 ? Math.min(1, Math.max(0, scoreCents / maxScoreCents)) : 0
  const isTop = rank !== undefined && rank <= topRanks
  const height = isTop ? topHeightPx : heightPx
  const label = copy.unitLabel(lengthCm(scoreCents))
  const haloSize = Math.round(height * 1.7)

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
        className="font-display tracking-tight tabular-nums flex items-baseline gap-2"
        style={{ fontSize: isTop ? topValuePx : valuePx, lineHeight: 1 }}
      >
        {prefix ? (
          <span aria-hidden className="select-none leading-none" style={{ fontSize: isTop ? '0.72em' : '0.85em' }}>
            {prefix}
          </span>
        ) : null}
        <span>{label}</span>
      </p>

      <div className="relative mt-3 w-full" style={{ paddingLeft: baseHalo ? haloSize / 2 : 0, paddingRight: tip ? 20 : 0 }}>
        <div
          className="relative w-full overflow-visible rounded-full"
          style={{ height, background: 'var(--l-track)' }}
          role="img"
          aria-label={label}
        >
          {baseHalo ? (
            <span
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: haloSize,
                height: haloSize,
                background: 'var(--l-fill)',
                boxShadow: '0 0 0 3px color-mix(in oklab, var(--l-fill) 35%, transparent), 0 0 14px color-mix(in oklab, var(--l-fill) 45%, transparent)',
                opacity: grown ? 1 : 0,
                transition: `opacity ${growMs}ms ease-out`,
              }}
            />
          ) : null}

          <div
            className="absolute top-0 left-0 h-full rounded-full"
            style={{
              width,
              minWidth: grown ? minPx : 0,
              background: 'var(--l-fill)',
              transition,
            }}
          >
            {tip ? (
              <span
                aria-hidden
                className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-[55%] select-none leading-none font-medium"
                style={{
                  fontSize: isTop ? 22 : 16,
                  color: 'var(--l-fill)',
                  textShadow: '0 0 8px color-mix(in oklab, var(--l-fill) 50%, transparent)',
                }}
              >
                {tip}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
