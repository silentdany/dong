import Stripe from "stripe";
import { getSql } from "@/lib/db";
import {
  assertListingMatchesTarget,
  checkoutReturnPath,
  expectedChargeMatchesPaid,
  listingIdFromStripeSession,
  parseChargeCents,
  type StripeLikeSession,
} from "@/lib/pay-bind";
import { quoteAmount, toCents, toDollars } from "@/lib/ranking";
import { currentLeaderDollars } from "@/lib/leader";
import { parseTarget } from "@/lib/target";

type DbListing = {
  id: string;
  display_name: string;
  target_type: string;
  target_key: string;
  target_url: string;
  description: string;
  all_time_cents: number;
  hidden: boolean;
};

export type CheckoutInput = {
  listingId?: string;
  target: string;
  displayName: string;
  description?: string;
  amountDollars: number;
  returnPath?: string;
  duelOpponentId?: string;
};

export type CheckoutResult =
  | { ok: true; url: string; listingId: string; demo?: false }
  | { ok: true; listingId: string; demo: true }
  | {
      ok: false;
      code:
        | "invalid-target"
        | "listing-mismatch"
        | "below-min"
        | "top-gap"
        | "invalid-amount"
        | "blocked-target"
        | "db-unavailable"
        | "stripe-error";
      minDollars?: number;
      leaderDollars?: number;
      neededDollars?: number;
    };

function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

function stripeSecret(): string | undefined {
  return process.env.STRIPE_SECRET_KEY?.trim() || undefined;
}

function webhookSecret(): string | undefined {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() || undefined;
}

function originFromEnv(): string | null {
  const explicit = process.env.APP_URL?.trim() || process.env.PUBLIC_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  if (process.env.VERCEL_URL?.trim()) return `https://${process.env.VERCEL_URL.trim()}`;
  return null;
}

let stripeClient: Stripe | null | undefined;

function stripe(): Stripe | null {
  if (stripeClient !== undefined) return stripeClient;
  const key = stripeSecret();
  stripeClient = key ? new Stripe(key) : null;
  return stripeClient;
}

function appOrigin(returnPath?: string): string {
  const env = originFromEnv();
  if (env) return env;
  if (returnPath?.startsWith("http")) return new URL(returnPath).origin;
  return "http://localhost:8080";
}

async function loadListingById(id: string): Promise<DbListing | null> {
  const sql = await getSql();
  const rows = await sql<DbListing>`
    select id, display_name, target_type, target_key, target_url, description,
           all_time_cents, hidden
    from listings where id = ${id} limit 1
  `;
  return rows[0] ?? null;
}

async function loadListingByKey(targetKey: string): Promise<DbListing | null> {
  const sql = await getSql();
  const rows = await sql<DbListing>`
    select id, display_name, target_type, target_key, target_url, description,
           all_time_cents, hidden
    from listings where target_key = ${targetKey} limit 1
  `;
  return rows[0] ?? null;
}

export type CreditResult =
  | { ok: true; duplicate: boolean }
  /** The database was unreachable. The money is real — this must be retried. */
  | { ok: false; code: "db-unavailable" }
  /** The listing is gone and nothing in the session says how to rebuild it. */
  | { ok: false; code: "listing-missing" };

export type CreditInput = {
  listingId: string;
  amountCents: number;
  stripeSessionId: string;
  description?: string;
  /**
   * Session metadata. A checkout can outlive the listing it was bound to (a
   * board reset, a manual delete), and `payments.listing_id` is a foreign key,
   * so without these the credit is a hard error on money already taken.
   */
  targetKey?: string;
  displayName?: string;
};

/** Postgres foreign_key_violation: the listing this payment points at is gone. */
function isMissingListing(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: string }).code === "23503"
  );
}

/** A target key already encodes the type and the URL — parse it back out. */
function targetFromKey(targetKey: string) {
  if (targetKey.startsWith("handle:")) return parseTarget(`@${targetKey.slice("handle:".length)}`);
  if (targetKey.startsWith("url:")) return parseTarget(targetKey.slice("url:".length));
  return null;
}

async function applyCredit(
  sql: Awaited<ReturnType<typeof getSql>>,
  listingId: string,
  input: CreditInput,
): Promise<{ ok: true; duplicate: boolean }> {
  const description = input.description ?? "";
  const updated = await sql<{ id: string }>`
    with ins as (
      insert into payments (id, listing_id, amount_cents, stripe_session_id, created_at)
      values (${newId("pay")}, ${listingId}, ${input.amountCents}, ${input.stripeSessionId}, now())
      on conflict (stripe_session_id) do nothing
      returning listing_id, amount_cents
    )
    update listings
    set all_time_cents = listings.all_time_cents + ins.amount_cents,
        description = case
          when ${description} <> '' then ${description}
          else listings.description
        end,
        updated_at = now()
    from ins
    where listings.id = ins.listing_id
    returning listings.id
  `;
  return { ok: true, duplicate: updated.length === 0 };
}

/**
 * Find something to credit when the bound listing has been deleted. The same
 * target listed again under a new id wins — the money belongs to that entry.
 * Otherwise the row is rebuilt under its original id so the binding still holds.
 */
async function rebindListing(
  sql: Awaited<ReturnType<typeof getSql>>,
  input: CreditInput,
): Promise<string | null> {
  const targetKey = input.targetKey?.trim();
  if (!targetKey) return null;

  const existing = await sql<{ id: string }>`
    select id from listings where target_key = ${targetKey} limit 1
  `;
  if (existing[0]) return existing[0].id;

  const parsed = targetFromKey(targetKey);
  if (!parsed) return null;
  // Rebuilt at zero: applyCredit adds this payment on top, so a listing that
  // comes back owns exactly what it can prove it paid.
  await sql`
    insert into listings (
      id, display_name, target_type, target_key, target_url, description,
      all_time_cents, click_count, hidden, created_at, updated_at
    ) values (
      ${input.listingId}, ${input.displayName?.trim() || parsed.label}, ${parsed.type},
      ${targetKey}, ${parsed.url}, ${input.description ?? ""}, 0, 0, false, now(), now()
    )
    on conflict (id) do nothing
  `;
  return input.listingId;
}

export async function creditPayment(input: CreditInput): Promise<CreditResult> {
  if (!input.listingId || input.amountCents < 1 || !input.stripeSessionId) {
    return { ok: true, duplicate: true };
  }
  try {
    const sql = await getSql();
    try {
      return await applyCredit(sql, input.listingId, input);
    } catch (error) {
      if (!isMissingListing(error)) throw error;
      const listingId = await rebindListing(sql, input);
      if (!listingId) {
        // Retrying cannot fix this, so the log line has to carry everything a
        // manual credit needs. Stripe is told to stop rather than to loop.
        console.error("[credit] orphaned payment, nothing to rebind", {
          stripeSessionId: input.stripeSessionId,
          listingId: input.listingId,
          amountCents: input.amountCents,
          targetKey: input.targetKey ?? null,
        });
        return { ok: false, code: "listing-missing" };
      }
      console.warn("[credit] rebound to listing", {
        stripeSessionId: input.stripeSessionId,
        from: input.listingId,
        to: listingId,
      });
      return await applyCredit(sql, listingId, input);
    }
  } catch (error) {
    console.error("[credit] failed", error);
    return { ok: false, code: "db-unavailable" };
  }
}

async function reserveListing(input: {
  existing: DbListing | null;
  parsed: { type: string; key: string; url: string };
  displayName: string;
  description: string;
}): Promise<string> {
  const sql = await getSql();
  if (input.existing) {
    if (input.existing.all_time_cents === 0) {
      await sql`
        update listings
        set display_name = ${input.displayName},
            description = ${input.description},
            target_type = ${input.parsed.type},
            target_url = ${input.parsed.url},
            updated_at = now()
        where id = ${input.existing.id}
      `;
    }
    return input.existing.id;
  }
  const id = newId("lst");
  await sql`
    insert into listings (
      id, display_name, target_type, target_key, target_url, description,
      all_time_cents, click_count, hidden, created_at, updated_at
    ) values (
      ${id}, ${input.displayName}, ${input.parsed.type}, ${input.parsed.key},
      ${input.parsed.url}, ${input.description}, 0, 0, false, now(), now()
    )
  `;
  return id;
}

export async function startCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  const parsed = parseTarget(input.target);
  if (!parsed) return { ok: false, code: "invalid-target" };
  const name = input.displayName.trim();
  if (!name) return { ok: false, code: "invalid-target" };

  try {
    const existing = input.listingId
      ? await loadListingById(input.listingId)
      : await loadListingByKey(parsed.key);

    if (input.listingId) {
      if (!existing) return { ok: false, code: "listing-mismatch" };
      const match = assertListingMatchesTarget({
        listingId: existing.id,
        listingTargetKey: existing.target_key,
        requestedListingId: input.listingId,
        requestedTargetKey: parsed.key,
      });
      if (!match.ok) return match;
    } else if (existing) {
      const match = assertListingMatchesTarget({
        listingId: existing.id,
        listingTargetKey: existing.target_key,
        requestedTargetKey: parsed.key,
      });
      if (!match.ok) return match;
    }

    if (existing?.hidden) return { ok: false, code: "blocked-target" };

    const currentDollars = toDollars(existing?.all_time_cents ?? 0);
    const leaderDollars = await currentLeaderDollars(existing?.id);
    const quoted = quoteAmount({
      amountDollars: input.amountDollars,
      currentDollars,
      leaderDollars,
      isNew: !existing || existing.all_time_cents <= 0,
    });
    if (!quoted.ok) return { ok: false, ...quoted.error };

    const listingId = await reserveListing({
      existing,
      parsed,
      displayName: name,
      description: input.description ?? "",
    });

    const chargeCents = toCents(quoted.chargeDollars);
    const successPath = checkoutReturnPath({
      listingId,
      returnPath: input.returnPath,
      duelOpponentId: input.duelOpponentId,
    });

    const client = stripe();
    if (!client) {
      const credited = await creditPayment({
        listingId,
        amountCents: chargeCents,
        stripeSessionId: `demo_${newId("sess")}`,
        description: input.description ?? "",
        targetKey: parsed.key,
        displayName: name,
      });
      // The listing was reserved a line ago, so it cannot be the missing one --
      // any failure here is the write itself.
      if (!credited.ok) return { ok: false, code: "db-unavailable" };
      return { ok: true, listingId, demo: true };
    }

    const origin = appOrigin();
    const description = (input.description ?? "").slice(0, 140);
    const session = await client.checkout.sessions.create({
      mode: "payment",
      client_reference_id: listingId,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: chargeCents,
            product_data: {
              name: `epenis.lol — ${existing?.display_name ?? name}`,
              description: `${input.amountDollars} cm`,
            },
          },
        },
      ],
      metadata: {
        listingId,
        targetKey: parsed.key,
        displayName: (existing?.display_name ?? name).slice(0, 140),
        chargeCents: String(chargeCents),
        description,
        returnPath: successPath,
      },
      payment_intent_data: {
        metadata: {
          listingId,
          targetKey: parsed.key,
        },
      },
      success_url: `${origin}/paid?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${successPath.split("?")[0] || "/"}`,
    });

    if (!session.url) return { ok: false, code: "stripe-error" };
    return { ok: true, url: session.url, listingId };
  } catch (error) {
    console.error("[checkout] failed", error);
    return { ok: false, code: "db-unavailable" };
  }
}

/**
 * `retry` is the only bit the webhook needs: true means the credit failed for a
 * reason that can pass, so Stripe must send the event again. Everything else --
 * credited, already credited, not ours -- is settled and must not be retried.
 */
export type FulfillResult = { ok: true; credited: boolean } | { ok: false; retry: boolean };

const NOTHING_TO_DO: FulfillResult = { ok: true, credited: false };

export async function fulfillStripeSession(session: StripeLikeSession): Promise<FulfillResult> {
  if (session.payment_status && session.payment_status !== "paid") return NOTHING_TO_DO;
  const listingId = listingIdFromStripeSession(session);
  const chargeCents = parseChargeCents(session.metadata);
  if (!listingId || !chargeCents) return NOTHING_TO_DO;
  if (!expectedChargeMatchesPaid(session.amount_total, chargeCents)) return NOTHING_TO_DO;
  const sessionId = session.id?.trim();
  if (!sessionId) return NOTHING_TO_DO;

  const credited = await creditPayment({
    listingId,
    amountCents: chargeCents,
    stripeSessionId: sessionId,
    description: session.metadata?.description,
    targetKey: session.metadata?.targetKey,
    displayName: session.metadata?.displayName,
  });
  if (credited.ok) return { ok: true, credited: !credited.duplicate };
  return { ok: false, retry: credited.code === "db-unavailable" };
}

export async function fulfillCheckoutSessionId(
  sessionId: string,
): Promise<{ listingId: string | null; returnPath: string }> {
  const fallback = { listingId: null as string | null, returnPath: "/?paid=1" };
  const client = stripe();
  if (!client || !sessionId.startsWith("cs_")) return fallback;
  const session = await client.checkout.sessions.retrieve(sessionId);
  await fulfillStripeSession(session);
  const listingId = listingIdFromStripeSession(session);
  if (!listingId) return fallback;
  return {
    listingId,
    returnPath: checkoutReturnPath({
      listingId,
      returnPath: session.metadata?.returnPath,
    }),
  };
}

export function constructStripeEvent(raw: string, signature: string): Stripe.Event | null {
  const secret = webhookSecret();
  const client = stripe();
  if (!secret || !client) return null;
  try {
    return client.webhooks.constructEvent(raw, signature, secret);
  } catch {
    return null;
  }
}
