import { copy } from '@config/copy'
import Board from '@/components/Board'
import BoardToggle from '@/components/BoardToggle'
import BidForm from '@/components/BidForm'
import { getBoard, leaderTotalCents, parseBoard } from '@/lib/board'
import { NEW_LISTING_MIN_CENTS, costToTakeTopCents, toDollars } from '@/lib/ranking'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ board?: string; paid?: string; l?: string }>

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const board = parseBoard(params.board)

  const [entries, leader] = await Promise.all([getBoard(board), leaderTotalCents()])
  const takeTopDollars = toDollars(costToTakeTopCents(leader ?? 0))

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="text-3xl font-bold tracking-tight">{copy.tagline}</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--l-muted)' }}>
          {copy.description}
        </p>
        <p className="mt-3 text-sm font-semibold" style={{ color: 'var(--l-accent)' }}>
          {copy.claimNumberOne(takeTopDollars)}
        </p>
      </section>

      {params.paid === '1' ? (
        <p
          className="p-3 text-sm"
          style={{ background: 'var(--l-card)', borderRadius: 'var(--l-radius)', color: 'var(--l-muted)' }}
        >
          {copy.ui.justPaid}
        </p>
      ) : null}

      <section
        className="p-4"
        style={{ background: 'var(--l-card)', borderRadius: 'var(--l-radius)' }}
        id="bid"
      >
        <h2 className="text-lg font-semibold">{copy.form.legend}</h2>
        <p className="mb-4 mt-1 text-xs" style={{ color: 'var(--l-muted)' }}>
          {copy.newListingHint(toDollars(NEW_LISTING_MIN_CENTS))}
        </p>
        <BidForm />
      </section>

      <section>
        <div className="mb-3">
          <BoardToggle active={board} />
        </div>
        <Board entries={entries} highlightId={params.l} />
      </section>
    </div>
  )
}
