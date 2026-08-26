import { copy } from '@config/copy'

type Props = {
  leaderCm: number
  takeTopDollars: number
}

export default function StickyCta({ leaderCm, takeTopDollars }: Props) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div
        className="pointer-events-auto mx-auto flex max-w-lg items-center gap-3 border p-3"
        style={{
          borderColor: 'var(--l-track)',
          background: 'color-mix(in oklab, var(--l-card) 95%, transparent)',
          borderRadius: 'var(--l-radius)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs" style={{ color: 'var(--l-muted)' }}>
            {copy.leaderLine(leaderCm)}
          </p>
          <p className="truncate text-sm font-medium">{copy.claimNumberOne(takeTopDollars)}</p>
        </div>
        <a
          href="#bid"
          className="inline-flex h-11 shrink-0 items-center rounded-sm px-4 text-sm font-medium"
          style={{ background: 'var(--l-accent)', color: 'var(--l-accentInk)' }}
        >
          {copy.ctaPrimary}
        </a>
      </div>
    </div>
  )
}
