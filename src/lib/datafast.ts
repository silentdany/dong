/**
 * DataFast as the source of truth for how many people have ever come.
 *
 * Their v1 API is visitor-, goal- and payment-shaped: `GET /visitors` answers
 * with a `pagination.total`, which is the number we want and costs one request
 * with `limit=1`. There is no documented endpoint for who is here *right now*,
 * so presence stays a local heartbeat (see stats.ts) rather than a guess at an
 * undocumented filter.
 *
 * Auth is a bearer key from the website's Settings > API tab, read from
 * DATAFAST_API_KEY. With no key set, this returns null and the board falls back
 * to its own counter — the pill must never go blank because a vendor is down.
 */

const ENDPOINT = "https://datafa.st/api/v1/visitors?limit=1";
const TIMEOUT_MS = 3_000;
/** Their API is rate-limited and this number moves slowly. Ask rarely. */
const TTL_MS = 60_000;

let cached: { at: number; total: number | null } | null = null;

async function fetchTotal(key: string): Promise<number | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(ENDPOINT, {
      headers: { authorization: `Bearer ${key}`, accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const body: unknown = await response.json();
    const total = (body as { pagination?: { total?: unknown } })?.pagination?.total;
    return typeof total === "number" && Number.isFinite(total) && total >= 0 ? total : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Total visitors DataFast has ever seen, or null when it cannot say. */
export async function datafastVisitors(): Promise<number | null> {
  const key = process.env.DATAFAST_API_KEY?.trim();
  if (!key) return null;
  if (cached && Date.now() - cached.at < TTL_MS) return cached.total;

  const total = await fetchTotal(key);
  // A failed read is cached too: a vendor outage must not turn one slow request
  // per minute into one slow request per heartbeat.
  cached = { at: Date.now(), total };
  return total;
}
