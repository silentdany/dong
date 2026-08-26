/**
 * Payment identity. Credit is bound to one listing id, never to a duel URL.
 *
 * A duel page has two ids in the path. If we ever credited from the URL, a
 * payment for one side would land on the other. Stripe metadata.listingId is
 * the only credit key. returnPath / left / right are UI only.
 */

export type StripeLikeSession = {
  id?: string;
  payment_status?: string | null;
  amount_total?: number | null;
  client_reference_id?: string | null;
  metadata?: Record<string, string> | null;
};

export function listingIdFromStripeSession(session: StripeLikeSession): string | null {
  const fromMeta = session.metadata?.listingId?.trim();
  if (fromMeta) return fromMeta;
  const fromRef = session.client_reference_id?.trim();
  if (fromRef) return fromRef;
  return null;
}

export function assertListingMatchesTarget(input: {
  listingId: string;
  listingTargetKey: string;
  requestedListingId?: string | null;
  requestedTargetKey?: string | null;
}): { ok: true } | { ok: false; code: "listing-mismatch" } {
  if (input.requestedListingId && input.requestedListingId !== input.listingId) {
    return { ok: false, code: "listing-mismatch" };
  }
  if (input.requestedTargetKey && input.requestedTargetKey !== input.listingTargetKey) {
    return { ok: false, code: "listing-mismatch" };
  }
  return { ok: true };
}

export function expectedChargeMatchesPaid(
  amountTotal: number | null | undefined,
  chargeCents: number,
): boolean {
  if (!amountTotal || amountTotal <= 0) return false;
  return amountTotal === chargeCents;
}

const SAFE_PATH = /^\/[A-Za-z0-9/_-]{0,280}$/;

export function safeReturnPath(raw: string | undefined, listingId: string): string {
  const paid = `paid=1&l=${encodeURIComponent(listingId)}`;
  if (!raw) return `/?${paid}`;
  const pathOnly = raw.split("?")[0] ?? "";
  if (!SAFE_PATH.test(pathOnly) || pathOnly.startsWith("//")) return `/?${paid}`;
  return `${pathOnly}?${paid}`;
}

export function duelReturnPath(listingId: string, opponentId: string): string | null {
  if (!listingId || !opponentId || listingId === opponentId) return null;
  if (!/^[A-Za-z0-9_-]+$/.test(listingId) || !/^[A-Za-z0-9_-]+$/.test(opponentId)) {
    return null;
  }
  return `/duel/${listingId}/${opponentId}`;
}

export function checkoutReturnPath(input: {
  listingId: string;
  returnPath?: string;
  duelOpponentId?: string;
}): string {
  const duel = input.duelOpponentId
    ? duelReturnPath(input.listingId, input.duelOpponentId)
    : null;
  return safeReturnPath(duel ?? input.returnPath, input.listingId);
}

export function parseChargeCents(metadata: Record<string, string> | null | undefined): number | null {
  const raw = metadata?.chargeCents?.trim();
  if (!raw || !/^[0-9]+$/.test(raw)) return null;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) return null;
  return value;
}
