import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { copy } from '@config/copy'
import { badgeFor } from '@config/theme'
import BidForm from '@/components/BidForm'
import RankMeter from '@/components/RankMeter'
import { prisma } from '@/lib/db'
import { leaderTotalCents } from '@/lib/board'
import { lengthMm, minTotalCents, toDollars, todayCutoff } from '@/lib/ranking'
import { relativeTime } from '@/lib/time'

export const dynamic = 'force-dynamic'

type Params = Promise<{ id: string }>

async function getListing(id: string) {
  const listing = await prisma.listing.findUnique({ where: { id } })
  if (!listing || listing.hidden || listing.allTimeCents <= 0) return null
  return listing
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params
  const listing = await getListing(id)
  if (!listing) return { title: copy.errors.notFound }

  const mm = lengthMm(listing.allTimeCents)
  const target = listing.targetType === 'handle' ? `@${listing.targetKey.slice('handle:'.length)}` : listing.targetUrl
  const title = copy.ui.detailTitle(listing.displayName)
  return {
    title: listing.displayName,
    description: listing.description || copy.ogDescription,
    openGraph: {
      title,
      description: listing.description || copy.ogDescription,
      images: [`/og?mm=${mm}&handle=${encodeURIComponent(target)}`],
    },
  }
}

export default async function ListingPage({ params }: { params: Params }) {
  const { id } = await params
  const listing = await getListing(id)
  if (!listing) notFound()

  const [todaySum, leader] = await Promise.all([
    prisma.payment.aggregate({
      where: { listingId: listing.id, createdAt: { gte: todayCutoff() } },
      _sum: { amountCents: true },
    }),
    leaderTotalCents(listing.id),
  ])

  const todayCents = todaySum._sum.amountCents ?? 0
  const target = listing.targetType === 'handle' ? `@${listing.targetKey.slice('handle:'.length)}` : listing.targetUrl
  const nextTotal = toDollars(minTotalCents(listing.allTimeCents))
  const maxScoreCents = Math.max(listing.allTimeCents, leader ?? 0)

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="font-display text-4xl leading-tight tracking-tight">{listing.displayName}</h1>
        {listing.description ? <p className="mt-1 text-sm">{listing.description}</p> : null}

        <div className="mt-4">
          <RankMeter scoreCents={listing.allTimeCents} maxScoreCents={maxScoreCents} rank={1} />
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt style={{ color: 'var(--l-muted)' }}>{copy.boardAllTime}</dt>
            <dd className="font-semibold tabular-nums">{copy.ui.total(toDollars(listing.allTimeCents))}</dd>
          </div>
          <div>
            <dt style={{ color: 'var(--l-muted)' }}>{copy.boardToday}</dt>
            <dd className="font-semibold tabular-nums">
              {copy.unitLabel(lengthMm(todayCents))} · {copy.ui.total(toDollars(todayCents))}
            </dd>
          </div>
        </dl>

        <p className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-xs" style={{ color: 'var(--l-muted)' }}>
          <a href={`/out/${listing.id}`} rel="nofollow noopener sponsored" target="_blank" className="underline underline-offset-2">
            {target}
          </a>
          <span>{badgeFor(listing.allTimeCents)}</span>
          <span>{relativeTime(listing.createdAt)}</span>
          <span className="tabular-nums">{copy.ui.clicks(listing.clickCount)}</span>
        </p>
      </section>

      <section className="p-4" style={{ background: 'var(--l-card)', borderRadius: 'var(--l-radius)' }}>
        <h2 className="font-display text-3xl leading-none">{copy.ctaRaise}</h2>
        <p className="mb-4 mt-1 text-xs" style={{ color: 'var(--l-muted)' }}>
          {copy.errors.belowMin(nextTotal)}
        </p>
        <BidForm
          lockedTarget={target}
          defaultName={listing.displayName}
          defaultDescription={listing.description}
          defaultAmount={nextTotal}
        />
      </section>

      <Link href="/" className="text-sm underline underline-offset-2" style={{ color: 'var(--l-accent)' }}>
        {copy.ui.backToBoard}
      </Link>
    </div>
  )
}
