import Link from 'next/link'
import { copy } from '@config/copy'
import type { BoardKind } from '@/lib/board'

const OPTIONS: { kind: BoardKind; label: string }[] = [
  { kind: 'today', label: copy.boardToday },
  { kind: 'all-time', label: copy.boardAllTime },
]

export default function BoardToggle({ active }: { active: BoardKind }) {
  return (
    <div
      className="inline-flex rounded-full p-1 text-sm"
      style={{ background: 'var(--l-track)', borderRadius: 'var(--l-radius)' }}
    >
      {OPTIONS.map((option) => {
        const selected = option.kind === active
        return (
          <Link
            key={option.kind}
            href={option.kind === 'today' ? '/' : '/?board=all-time'}
            aria-current={selected ? 'true' : undefined}
            className="px-3 py-1 font-medium"
            style={{
              borderRadius: 'var(--l-radius)',
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
