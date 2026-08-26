export const NEW_LISTING_MIN = 5;
export const RAISE_MIN = 1;
export const TOP_GAP = 5;

export function toDollars(cents: number) {
  return Math.round(cents / 100);
}

export function toCents(dollars: number) {
  return Math.round(dollars) * 100;
}

export function lengthCm(cents: number) {
  return toDollars(cents);
}

export function costToTakeTop(leaderDollars: number) {
  if (leaderDollars <= 0) return NEW_LISTING_MIN;
  return leaderDollars + TOP_GAP;
}

export type RankRow = {
  allTimeCents: number;
  createdAt: string;
  id?: string;
};

export function projectedRank(
  amountDollars: number,
  listings: RankRow[],
  existingId?: string,
): number {
  const amountCents = toCents(amountDollars);
  const others = listings.filter((row) => row.id !== existingId);
  let rank = 1;
  for (const row of others) {
    if (row.allTimeCents > amountCents) rank += 1;
    else if (row.allTimeCents === amountCents) rank += 1;
  }
  return rank;
}

export type QuoteError =
  | { code: "below-min"; minDollars: number }
  | { code: "top-gap"; leaderDollars: number; neededDollars: number }
  | { code: "invalid-amount" };

export function quoteAmount(input: {
  amountDollars: number;
  currentDollars: number;
  leaderDollars: number;
  isNew: boolean;
}): { ok: true; chargeDollars: number } | { ok: false; error: QuoteError } {
  const { amountDollars, currentDollars, leaderDollars, isNew } = input;
  if (!Number.isInteger(amountDollars) || amountDollars < 1) {
    return { ok: false, error: { code: "invalid-amount" } };
  }
  if (isNew && amountDollars < NEW_LISTING_MIN) {
    return { ok: false, error: { code: "below-min", minDollars: NEW_LISTING_MIN } };
  }
  if (!isNew && amountDollars < currentDollars + RAISE_MIN) {
    return {
      ok: false,
      error: { code: "below-min", minDollars: currentDollars + RAISE_MIN },
    };
  }
  if (amountDollars > leaderDollars && amountDollars < leaderDollars + TOP_GAP) {
    return {
      ok: false,
      error: {
        code: "top-gap",
        leaderDollars,
        neededDollars: leaderDollars + TOP_GAP,
      },
    };
  }
  const charge = isNew ? amountDollars : amountDollars - currentDollars;
  if (charge < 1) {
    return { ok: false, error: { code: "invalid-amount" } };
  }
  return { ok: true, chargeDollars: charge };
}
