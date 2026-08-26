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

/** Public hosts Stripe is allowed to send a cardholder back to. */
const ALLOWED_CHECKOUT_HOSTS = new Set([
  "epenis.lol",
  "www.epenis.lol",
  "epenis.vercel.app",
]);

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

export const CHECKOUT_CANONICAL_ORIGIN = "https://epenis.lol";

export function hostnameOf(raw: string): string {
  try {
    const url = raw.includes("://") ? new URL(raw) : new URL(`https://${raw}`);
    return url.hostname.toLowerCase();
  } catch {
    return "";
  }
}

/**
 * Unique Vercel URLs (`project-hash-scope.vercel.app`) are deployment-protection
 * walls. Stripe must never send a customer there after they paid.
 */
export function isEphemeralVercelHost(host: string): boolean {
  const h = host.toLowerCase().split(":")[0];
  if (ALLOWED_CHECKOUT_HOSTS.has(h)) return false;
  return h === "vercel.app" || h.endsWith(".vercel.app") || h === "vercel.com" || h.endsWith(".vercel.com");
}

export function isAllowedCheckoutHost(host: string): boolean {
  const h = host.toLowerCase().split(":")[0];
  return ALLOWED_CHECKOUT_HOSTS.has(h) || LOCAL_HOSTS.has(h);
}

function normalizeOrigin(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const url = trimmed.includes("://") ? new URL(trimmed) : new URL(`https://${trimmed}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (url.username || url.password) return null;
    return url.origin;
  } catch {
    return null;
  }
}

export type CheckoutOriginInput = {
  appUrl?: string | null;
  publicAppUrl?: string | null;
  /** Ignored on purpose — this is the unique per-deploy host. */
  vercelUrl?: string | null;
  vercelProductionUrl?: string | null;
  requestOrigin?: string | null;
  nodeEnv?: string | null;
  onVercel?: boolean;
  canonicalOrigin?: string;
};

/**
 * Origin baked into Stripe success/cancel URLs. Never `VERCEL_URL`: that is
 * `epenis-<hash>-<team>.vercel.app`, which 404s or SSO-gates the receipt.
 */
export function resolveCheckoutOrigin(input: CheckoutOriginInput): string {
  const canonical = (input.canonicalOrigin ?? CHECKOUT_CANONICAL_ORIGIN).replace(/\/+$/, "");
  const prod = input.vercelProductionUrl?.trim();
  const candidates = [
    input.appUrl,
    input.publicAppUrl,
    input.requestOrigin,
    prod ? (prod.includes("://") ? prod : `https://${prod}`) : null,
  ];
  for (const raw of candidates) {
    const origin = normalizeOrigin(raw);
    if (!origin) continue;
    const host = hostnameOf(origin);
    if (isEphemeralVercelHost(host)) continue;
    if (isAllowedCheckoutHost(host)) return origin;
  }
  if (input.onVercel || input.nodeEnv === "production") return canonical;
  return "http://localhost:8080";
}

/** Keep the payer on a public host; bounce unique Vercel deploys to canonical. */
export function publicPaidHref(
  returnPath: string,
  currentHost?: string | null,
  canonicalOrigin = CHECKOUT_CANONICAL_ORIGIN,
): string {
  const pathOnly = (returnPath.split("?")[0] ?? "") || "/";
  const query = returnPath.includes("?") ? returnPath.slice(returnPath.indexOf("?")) : "";
  const path =
    SAFE_PATH.test(pathOnly) && !pathOnly.startsWith("//") ? `${pathOnly}${query}` : "/?paid=1";
  const host = (currentHost ?? "").toLowerCase().split(":")[0];
  if (!host || LOCAL_HOSTS.has(host) || ALLOWED_CHECKOUT_HOSTS.has(host)) return path;
  return `${canonicalOrigin.replace(/\/+$/, "")}${path}`;
}
