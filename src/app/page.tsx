import { copy } from '@config/copy'
import Board from '@/components/Board'
import BoardToggle from '@/components/BoardToggle'
import BidForm from '@/components/BidForm'
import StickyCta from '@/components/StickyCta'
import { getBoard, leaderTotalCents, parseBoard } from '@/lib/board'
import { NEW_LISTING_MIN_CENTS, costToTakeTopCents, lengthCm, toDollars } from '@/lib/ranking'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ board?: string; paid?: string; l?: string }>

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const board = parseBoard(params.board)

  const [entries, leader] = await Promise.all([getBoard(board), leaderTotalCents()])
  const takeTopDollars = toDollars(costToTakeTopCents(leader ?? 0))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">{copy.tagline}</h1>
        <p className="mt-2 text-sm font-medium">{copy.kicker}</p>
        <p className="mt-3 max-w-prose text-sm" style={{ color: 'var(--l-muted)' }}>
          {copy.description}
        </p>
        <p className="mt-4 text-sm font-medium">{copy.claimNumberOne(takeTopDollars)}</p>
      </div>

      {params.paid === '1' ? (
        <p
          className="p-3 text-sm"
          style={{ background: 'var(--l-card)', borderRadius: 'var(--l-radius)', color: 'var(--l-muted)' }}
        >
          {copy.ui.justPaid}
        </p>
      ) : null}

      <BoardToggle active={board} />

      <Board entries={entries} highlightId={params.l} />

      <section className="p-4" style={{ background: 'var(--l-card)', borderRadius: 'var(--l-radius)' }} id="bid">
        <h2 className="font-display text-3xl leading-none">{copy.form.legend}</h2>
        <p className="mb-5 mt-2 text-sm" style={{ color: 'var(--l-muted)' }}>
          {copy.newListingHint(toDollars(NEW_LISTING_MIN_CENTS))}
        </p>
        <BidForm defaultAmount={takeTopDollars} />
      </section>

      <StickyCta leaderCm={lengthCm(leader ?? 0)} takeTopDollars={takeTopDollars} />
    </div>
  )
}
