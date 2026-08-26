import { prisma } from './db'
import { compareRank, todayCutoff } from './ranking'

export type BoardKind = 'today' | 'all-time'

export type BoardEntry = {
  id: string
  displayName: string
  description: string
  targetType: string
  targetKey: string
  targetUrl: string
  clickCount: number
  createdAt: Date
  scoreCents: number
  allTimeCents: number
}

export function parseBoard(value: string | undefined): BoardKind {
  return value === 'all-time' ? 'all-time' : 'today'
}

const VISIBLE = { hidden: false } as const

function toEntry(listing: {
  id: string
  displayName: string
  description: string
  targetType: string
  targetKey: string
  targetUrl: string
  clickCount: number
  createdAt: Date
  allTimeCents: number
}, scoreCents: number): BoardEntry {
  return { ...listing, scoreCents }
}

async function allTimeBoard(limit: number): Promise<BoardEntry[]> {
  // A listing only exists on a board once it has actually paid, which also keeps
  // abandoned checkout drafts (allTimeCents = 0) out of sight.
  const listings = await prisma.listing.findMany({
    where: { ...VISIBLE, allTimeCents: { gt: 0 } },
    orderBy: [{ allTimeCents: 'desc' }, { createdAt: 'asc' }],
    take: limit,
  })
  return listings.map((listing) => toEntry(listing, listing.allTimeCents))
}

async function todayBoard(limit: number): Promise<BoardEntry[]> {
  const sums = await prisma.payment.groupBy({
    by: ['listingId'],
    where: { createdAt: { gte: todayCutoff() } },
    _sum: { amountCents: true },
  })
  if (sums.length === 0) return []

  const scores = new Map(sums.map((row) => [row.listingId, row._sum.amountCents ?? 0]))
  const listings = await prisma.listing.findMany({
    where: { ...VISIBLE, id: { in: [...scores.keys()] } },
  })

  return listings
    .map((listing) => toEntry(listing, scores.get(listing.id) ?? 0))
    .filter((entry) => entry.scoreCents > 0)
    .sort(compareRank)
    .slice(0, limit)
}

export function getBoard(kind: BoardKind, limit = 100): Promise<BoardEntry[]> {
  return kind === 'all-time' ? allTimeBoard(limit) : todayBoard(limit)
}

/** Top lifetime total on the board, ignoring one listing (the bidder itself). */
export async function leaderTotalCents(exceptListingId?: string): Promise<number | null> {
  const top = await prisma.listing.findFirst({
    where: { ...VISIBLE, allTimeCents: { gt: 0 }, ...(exceptListingId ? { id: { not: exceptListingId } } : {}) },
    orderBy: [{ allTimeCents: 'desc' }, { createdAt: 'asc' }],
    select: { allTimeCents: true },
  })
  return top?.allTimeCents ?? null
}

export async function allTimeScores(exceptListingId?: string): Promise<number[]> {
  const rows = await prisma.listing.findMany({
    where: { ...VISIBLE, allTimeCents: { gt: 0 }, ...(exceptListingId ? { id: { not: exceptListingId } } : {}) },
    orderBy: { allTimeCents: 'desc' },
    select: { allTimeCents: true },
    take: 500,
  })
  return rows.map((row) => row.allTimeCents)
}
