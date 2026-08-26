import Link from 'next/link'
import { copy } from '@config/copy'
import { badgeFor } from '@config/theme'
import RankMeter from './RankMeter'
import type { BoardEntry } from '@/lib/board'
import { toDollars } from '@/lib/ranking'
import { relativeTime } from '@/lib/time'

type Props = {
  entry: BoardEntry
  rank: number
  maxScoreCents: number
  highlighted?: boolean
}

export default function ListingRow({ entry, rank, maxScoreCents, highlighted }: Props) {
  const label = entry.targetType === 'handle' ? `@${entry.targetKey.slice('handle:'.length)}` : entry.targetUrl

  return (
    <li
      className="flex gap-3 p-4"
      style={{
        background: 'var(--l-card)',
        borderRadius: 'var(--l-radius)',
        outline: highlighted ? '1px solid color-mix(in oklab, var(--l-ink) 22%, transparent)' : 'none',
      }}
    >
      <span className="w-7 shrink-0 pt-1 text-sm font-medium tabular-nums" style={{ color: 'var(--l-muted)' }}>
        {rank === 1 ? (
          <span className="text-lg leading-none" aria-label="1">
            {copy.logo}
          </span>
        ) : (
          rank
        )}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <Link href={`/l/${entry.id}`} className="truncate font-medium underline-offset-2 hover:underline">
            {entry.displayName}
          </Link>
          <span className="shrink-0 text-xs uppercase tracking-wide" style={{ color: 'var(--l-muted)' }}>
            {badgeFor(entry.scoreCents)}
          </span>
        </div>

        {entry.description ? (
          <p className="mt-0.5 line-clamp-2 text-sm" style={{ color: 'var(--l-muted)' }}>
            {entry.description}
          </p>
        ) : null}

        <div className="mt-3">
          <RankMeter scoreCents={entry.scoreCents} maxScoreCents={maxScoreCents} rank={rank} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs" style={{ color: 'var(--l-muted)' }}>
          <span className="tabular-nums">{copy.ui.total(toDollars(entry.scoreCents))}</span>
          <a
            href={`/out/${entry.id}`}
            rel="nofollow noopener sponsored"
            target="_blank"
            className="max-w-[12rem] truncate underline underline-offset-2 sm:max-w-[16rem]"
          >
            {label}
          </a>
          <span>{relativeTime(entry.createdAt)}</span>
          <Link href={`/l/${entry.id}`} className="font-medium underline-offset-2 hover:underline" style={{ color: 'var(--l-accent)' }}>
            {copy.ctaRaise}
          </Link>
        </div>
      </div>
    </li>
  )
}
