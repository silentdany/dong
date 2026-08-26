import Link from 'next/link'
import { copy } from '@config/copy'
import type { BoardKind } from '@/lib/board'

const OPTIONS: { kind: BoardKind; label: string }[] = [
  { kind: 'today', label: copy.boardToday },
  { kind: 'all-time', label: copy.boardAllTime },
]

export default function BoardToggle({ active }: { active: BoardKind }) {
  return (
    <div className="flex p-1" style={{ background: 'var(--l-card)', borderRadius: '8px' }}>
      {OPTIONS.map((option) => {
        const selected = option.kind === active
        return (
          <Link
            key={option.kind}
            href={option.kind === 'today' ? '/' : '/?board=all-time'}
            aria-current={selected ? 'true' : undefined}
            className="flex h-10 flex-1 items-center justify-center px-3 text-sm font-medium"
            style={{
              borderRadius: '6px',
              background: selected ? 'var(--l-accent)' : 'transparent',
              color: selected ? 'var(--l-accentInk)' : 'var(--l-muted)',
            }}
          >
            {option.label}
          </Link>
        )
      })}
    </div>
  )
}
