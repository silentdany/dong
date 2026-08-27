/**
 * The two numbers in the pill, read from DataFast.
 *
 * `/analytics/realtime` answers who is on the site right now; `/analytics/
 * overview` answers how many people have come over a date range. Not
 * `/visitors`: that is the visitor *list*, and its `pagination.total` counts
 * rows matching a search over an undocumented default window, which is a
 * different question that happens to return a plausible number.
 *
 * Endpoints, bearer auth and response shapes follow the official CLI
 * (github.com/dqhieu/datafast-cli) — the docs do not spell the last one out,
 * and both routes answer with either an object or a one-element array.
 *
 * Reads are cached per instance: their API is rate-limited and the pill polls
 * every 30s per viewer. A failure is cached too, so an outage costs one slow
 * request per window rather than one per heartbeat — and it is logged, so a
 * missing number shows up in the logs instead of silently reading as zero.
 */

const BASE = "https://datafa.st/api/v1";
const TIMEOUT_MS = 3_000;

/** Whoever is on the site now moves fast; the lifetime total does not. */
const REALTIME_TTL_MS = 20_000;
const OVERVIEW_TTL_MS = 300_000;

/**
 * "Since launch" needs an explicit start: the range default is undocumented, so
 * without one the total would be whatever window they happen to pick. Reaching
 * back before the script went in is harmless — DataFast has nothing there.
 */
const LAUNCH_DATE = "2026-08-26";

export type VendorStats = { online: number | null; visitors: number | null };

type Cache<T> = { at: number; value: T } | null;
let realtimeCache: Cache<number | null> = null;
let overviewCache: Cache<number | null> = null;
let warnedMissingKey = false;

function apiKey(): string | undefined {
  const key = process.env.DATAFAST_API_KEY?.trim();
  if (!key && !warnedMissingKey) {
    warnedMissingKey = true;
    console.warn("[datafast] DATAFAST_API_KEY is not set — the board is counting for itself.");
  }
  return key || undefined;
}

async function get(path: string, key: string): Promise<unknown | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${BASE}${path}`, {
      headers: { authorization: `Bearer ${key}`, accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) {
      console.error(`[datafast] GET ${path} → ${response.status}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`[datafast] GET ${path} failed`, error);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Both endpoints answer with either an object or a one-element array — the
 * official CLI unmarshals both — so read the field through the same door.
 */
function readNumber(body: unknown, field: string): number | null {
  const row = Array.isArray(body) ? body[0] : body;
  if (!row || typeof row !== "object") return null;
  const value = (row as Record<string, unknown>)[field];
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
}

function fresh<T>(cache: Cache<T>, ttl: number): cache is { at: number; value: T } {
  return cache !== null && Date.now() - cache.at < ttl;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** People on the site right now, per DataFast. */
async function realtimeOnline(key: string): Promise<number | null> {
  if (fresh(realtimeCache, REALTIME_TTL_MS)) return realtimeCache.value;
  const value = readNumber(await get("/analytics/realtime", key), "visitors");
  realtimeCache = { at: Date.now(), value };
  return value;
}

/** Everyone DataFast has seen since the board opened. */
async function overviewVisitors(key: string): Promise<number | null> {
  if (fresh(overviewCache, OVERVIEW_TTL_MS)) return overviewCache.value;
  const query = `?startAt=${LAUNCH_DATE}&endAt=${today()}&timezone=UTC`;
  const value = readNumber(await get(`/analytics/overview${query}`, key), "visitors");
  overviewCache = { at: Date.now(), value };
  return value;
}

/** Null on either number means "DataFast cannot say" — the caller falls back. */
export async function datafastStats(): Promise<VendorStats> {
  const key = apiKey();
  if (!key) return { online: null, visitors: null };
  const [online, visitors] = await Promise.all([realtimeOnline(key), overviewVisitors(key)]);
  return { online, visitors };
}

/* ---------------------------------------------------------------------------
 * Revenue attribution.
 *
 * The first-party cookies `datafast_visitor_id` and `datafast_session_id` go on
 * the Stripe Checkout session (and PaymentIntent) so DataFast can match the
 * charge to the visit. Missing cookies are omitted — a first-time hit without
 * the script must still be able to pay.
 * ------------------------------------------------------------------------- */

const VISITOR_COOKIE = "datafast_visitor_id";
const SESSION_COOKIE = "datafast_session_id";
/** Stripe metadata values cap at 500 characters. */
const META_MAX = 500;

function cookieValue(header: string | null | undefined, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    if (trimmed.slice(0, eq) !== name) continue;
    const raw = trimmed.slice(eq + 1);
    let value = raw;
    try {
      value = decodeURIComponent(raw);
    } catch {
      value = raw;
    }
    value = value.trim();
    if (!value) return undefined;
    return value.slice(0, META_MAX);
  }
  return undefined;
}

/**
 * Stripe Checkout / PaymentIntent metadata DataFast reads to attribute a charge.
 * Empty when the visitor has no cookies yet — checkout still proceeds.
 */
export function datafastStripeMetadata(
  cookieHeader: string | null | undefined,
): Record<string, string> {
  const visitor = cookieValue(cookieHeader, VISITOR_COOKIE);
  const session = cookieValue(cookieHeader, SESSION_COOKIE);
  const meta: Record<string, string> = {};
  if (visitor) meta.datafast_visitor_id = visitor;
  if (session) meta.datafast_session_id = session;
  return meta;
}
