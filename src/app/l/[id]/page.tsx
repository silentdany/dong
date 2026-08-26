import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { copy } from '@config/copy'
import { badgeFor } from '@config/theme'
import BidForm from '@/components/BidForm'
import RankMeter from '@/components/RankMeter'
import { prisma } from '@/lib/db'
import { leaderTotalCents } from '@/lib/board'
import { targetLabel } from '@/lib/normalize'
import { ogImage, ogListing } from '@/lib/og/links'
import { costToTakeTopCents, lengthCm, minTotalCents, toDollars, todayCutoff } from '@/lib/ranking'
import { relativeTime } from '@/lib/time'

export const dynamic = 'force-dynamic'

type Params = Promise<{ id: string }>

/** Cached so the share card and the page itself cost one query, not two. */
const getListing = cache(async (id: string) => {
  const listing = await prisma.listing.findUnique({ where: { id } })
  if (!listing || listing.hidden || listing.allTimeCents <= 0) return null
  return listing
})

const getLeader = cache((exceptId: string) => leaderTotalCents(exceptId))

/** Same ordering the board uses: money first, then the older listing. */
const getRank = cache(async (id: string) => {
  const listing = await getListing(id)
  if (!listing) return 0
  const ahead = await prisma.listing.count({
    where: {
      hidden: false,
      OR: [
        { allTimeCents: { gt: listing.allTimeCents } },
        { allTimeCents: listing.allTimeCents, createdAt: { lt: listing.createdAt } },
      ],
    },
  })
  return ahead + 1
})

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params
  const listing = await getListing(id)
  if (!listing) return { title: copy.errors.notFound }

  const [leader, rank] = await Promise.all([getLeader(listing.id), getRank(listing.id)])
  const cm = lengthCm(listing.allTimeCents)
  const ceiling = Math.max(listing.allTimeCents, leader ?? 0)
  const title = copy.ui.detailTitle(listing.displayName)
  const description = listing.description || copy.ogDescription

  const image = ogListing({
    name: listing.displayName,
    target: targetLabel(listing),
    cm,
    rank,
    ratio: ceiling > 0 ? listing.allTimeCents / ceiling : 0,
    badge: badgeFor(listing.allTimeCents),
    desc: listing.description,
    takeTop: Math.max(0, toDollars(costToTakeTopCents(leader ?? 0) - listing.allTimeCents)),
  })
  const images = [ogImage(image, copy.og.alt.listing(listing.displayName, cm))]

  return {
    title: listing.displayName,
    description,
    openGraph: { title, description, images },
    twitter: { card: 'summary_large_image', title, description, images },
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
    getLeader(listing.id),
  ])

  const todayCents = todaySum._sum.amountCents ?? 0
  const target = targetLabel(listing)
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
              {copy.unitLabel(lengthCm(todayCents))} · {copy.ui.total(toDollars(todayCents))}
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
