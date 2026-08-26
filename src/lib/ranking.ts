export const NEW_LISTING_MIN_CENTS = 500
export const RAISE_STEP_CENTS = 100
export const TAKE_TOP_LEAD_CENTS = 500
export const TODAY_WINDOW_MS = 24 * 60 * 60 * 1000

/** $1 = 1 cm, and partial dollars buy nothing. */
export function lengthCm(scoreCents: number): number {
  return Math.floor(scoreCents / 100)
}

export function toDollars(cents: number): number {
  return Math.floor(cents / 100)
}

/** Smallest lifetime total a listing may declare next. */
export function minTotalCents(currentTotalCents: number): number {
  return currentTotalCents > 0 ? currentTotalCents + RAISE_STEP_CENTS : NEW_LISTING_MIN_CENTS
}

export function costToTakeTopCents(leaderTotalCents: number): number {
  return leaderTotalCents + TAKE_TOP_LEAD_CENTS
}

export type TotalCheck =
  | { ok: true }
  | { ok: false; reason: 'below-min'; minTotalCents: number }
  | { ok: false; reason: 'top-gap'; leaderTotalCents: number; neededCents: number }

/**
 * `leaderTotalCents` is the top lifetime total excluding this listing itself,
 * or null when the board is empty.
 */
export function checkTotal(input: {
  newTotalCents: number
  currentTotalCents: number
  leaderTotalCents: number | null
}): TotalCheck {
  const min = minTotalCents(input.currentTotalCents)
  if (input.newTotalCents < min) return { ok: false, reason: 'below-min', minTotalCents: min }

  // #1 is not sold a dollar at a time: to end up above the leader you must clear
  // them by TAKE_TOP_LEAD_CENTS. Landing on or under the leader is legal, it just
  // buys a lower rank -- and an exact tie loses, because ties favour the older listing.
  const leader = input.leaderTotalCents
  if (leader !== null && input.newTotalCents > leader && input.newTotalCents < costToTakeTopCents(leader)) {
    return { ok: false, reason: 'top-gap', leaderTotalCents: leader, neededCents: costToTakeTopCents(leader) }
  }

  return { ok: true }
}

/** A listing already in the board only pays the difference. */
export function chargeCents(currentTotalCents: number, newTotalCents: number): number {
  return newTotalCents - currentTotalCents
}

export type Rankable = { scoreCents: number; createdAt: Date }

/** Money descending; on an exact tie the older listing keeps the higher rank. */
export function compareRank(a: Rankable, b: Rankable): number {
  if (b.scoreCents !== a.scoreCents) return b.scoreCents - a.scoreCents
  return a.createdAt.getTime() - b.createdAt.getTime()
}

/** Rank a hypothetical total would land at, 1-indexed. */
export function projectedRank(sortedScoresCents: number[], newTotalCents: number): number {
  let ahead = 0
  for (const score of sortedScoresCents) {
    if (score >= newTotalCents) ahead += 1
  }
  return ahead + 1
}

export function todayCutoff(now: Date = new Date()): Date {
  return new Date(now.getTime() - TODAY_WINDOW_MS)
}
