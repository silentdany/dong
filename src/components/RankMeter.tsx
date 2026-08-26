import { theme } from '@config/theme'

type Props = {
  scoreCents: number
  maxScoreCents: number
  label?: string
}

/**
 * The only visual representation of a score in the app. Abstract on purpose:
 * a track, a fill sized by score / maxVisibleScore, and one character at the
 * leading edge. Pure CSS, no images. Reskin by editing theme.meter.
 */
export default function RankMeter({ scoreCents, maxScoreCents, label }: Props) {
  const ratio = maxScoreCents > 0 ? Math.min(1, Math.max(0, scoreCents / maxScoreCents)) : 0
  const cap = theme.meter.cap

  return (
    <div
      className="w-full"
      style={{ maxWidth: 'var(--l-meter-max)' }}
      role="img"
      aria-label={label ?? `${Math.round(ratio * 100)}%`}
    >
      <div
        className="relative h-3 w-full overflow-visible rounded-full"
        style={{ background: 'var(--l-track)' }}
      >
        <div
          className="h-3 rounded-full"
          style={{
            width: `${ratio * 100}%`,
            minWidth: 'var(--l-meter-min)',
            background: 'var(--l-fill)',
            transition: `width var(--l-meter-grow) cubic-bezier(0.2, 0.8, 0.2, 1)`,
          }}
        />
        {cap ? (
          <span
            aria-hidden
            className="pointer-events-none absolute top-1/2 -translate-y-1/2 select-none text-[11px] leading-none"
            style={{
              left: `max(var(--l-meter-min), ${ratio * 100}%)`,
              marginLeft: '2px',
              color: 'var(--l-fill)',
              transition: `left var(--l-meter-grow) cubic-bezier(0.2, 0.8, 0.2, 1)`,
            }}
          >
            {cap}
          </span>
        ) : null}
      </div>
    </div>
  )
}
