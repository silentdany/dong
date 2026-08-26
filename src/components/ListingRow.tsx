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
      className="flex gap-2.5 p-3 sm:gap-3"
      style={{
        background: 'var(--l-card)',
        borderRadius: 'var(--l-radius)',
        outline: highlighted ? '2px solid var(--l-accent)' : 'none',
      }}
    >
      <span className="w-7 shrink-0 pt-0.5 text-base font-bold tabular-nums sm:w-8 sm:text-lg" style={{ color: 'var(--l-muted)' }}>
        {rank}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <Link href={`/l/${entry.id}`} className="truncate font-semibold underline-offset-2 hover:underline">
            {entry.displayName}
          </Link>
          <span className="text-xs" style={{ color: 'var(--l-muted)' }}>
            {badgeFor(entry.scoreCents)}
          </span>
        </div>

        {entry.description ? (
          <p className="mt-0.5 line-clamp-2 text-sm" style={{ color: 'var(--l-muted)' }}>
            {entry.description}
          </p>
        ) : null}

        <div className="mt-2">
          <RankMeter scoreCents={entry.scoreCents} maxScoreCents={maxScoreCents} rank={rank} />
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs" style={{ color: 'var(--l-muted)' }}>
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
          <span className="tabular-nums">{copy.ui.clicks(entry.clickCount)}</span>
          <Link href={`/l/${entry.id}`} className="font-medium underline underline-offset-2" style={{ color: 'var(--l-accent)' }}>
            {copy.ctaRaise}
          </Link>
        </div>
      </div>
    </li>
  )
}
