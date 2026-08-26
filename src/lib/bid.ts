import { prisma } from './db'
import { allTimeScores, leaderTotalCents } from './board'
import { normalizeTarget, type NormalizedTarget } from './normalize'
import { chargeCents, checkTotal, costToTakeTopCents, minTotalCents, projectedRank } from './ranking'
import type { BidInput } from './validation'

export type PricedBid = {
  target: NormalizedTarget
  listingId: string | null
  currentTotalCents: number
  newTotalCents: number
  chargeCents: number
  minTotalCents: number
  leaderTotalCents: number | null
  costToTakeTopCents: number
  projectedRank: number
}

export type PriceError =
  | { ok: false; code: 'invalid-target' }
  | { ok: false; code: 'blocked-target' }
  | { ok: false; code: 'below-min'; minDollars: number }
  | { ok: false; code: 'top-gap'; leaderDollars: number; neededDollars: number }

export type PriceResult = { ok: true; bid: PricedBid } | PriceError

/** Resolves a form submission into a server-computed price. Read-only. */
export async function priceBid(input: BidInput): Promise<PriceResult> {
  const normalized = normalizeTarget(input.target)
  if (!normalized.ok) {
    return { ok: false, code: normalized.reason === 'blocked' ? 'blocked-target' : 'invalid-target' }
  }

  const target = normalized.target
  const listing = await prisma.listing.findUnique({
    where: { targetKey: target.targetKey },
    select: { id: true, allTimeCents: true, hidden: true },
  })
  if (listing?.hidden) return { ok: false, code: 'blocked-target' }

  const currentTotalCents = listing?.allTimeCents ?? 0
  const newTotalCents = input.amountDollars * 100
  const leader = await leaderTotalCents(listing?.id)

  const check = checkTotal({ newTotalCents, currentTotalCents, leaderTotalCents: leader })
  if (!check.ok) {
    if (check.reason === 'below-min') {
      return { ok: false, code: 'below-min', minDollars: check.minTotalCents / 100 }
    }
    return {
      ok: false,
      code: 'top-gap',
      leaderDollars: check.leaderTotalCents / 100,
      neededDollars: check.neededCents / 100,
    }
  }

  const scores = await allTimeScores(listing?.id)

  return {
    ok: true,
    bid: {
      target,
      listingId: listing?.id ?? null,
      currentTotalCents,
      newTotalCents,
      chargeCents: chargeCents(currentTotalCents, newTotalCents),
      minTotalCents: minTotalCents(currentTotalCents),
      leaderTotalCents: leader,
      costToTakeTopCents: costToTakeTopCents(leader ?? 0),
      projectedRank: projectedRank(scores, newTotalCents),
    },
  }
}

/**
 * Reserves the listing row so the webhook has something to credit. A draft holds
 * allTimeCents = 0 until Stripe confirms, so it never appears on a board.
 */
export async function reserveListing(bid: PricedBid, input: BidInput): Promise<string> {
  const fields = {
    displayName: input.displayName,
    description: input.description,
    targetType: bid.target.targetType,
    targetUrl: bid.target.targetUrl,
  }

  if (!bid.listingId) {
    const created = await prisma.listing.create({
      data: { ...fields, targetKey: bid.target.targetKey },
      select: { id: true },
    })
    return created.id
  }

  // An existing listing keeps the name it paid for; only an unpaid draft is
  // allowed to be overwritten by whoever shows up next.
  if (bid.currentTotalCents === 0) {
    await prisma.listing.update({ where: { id: bid.listingId }, data: fields })
  }
  return bid.listingId
}
