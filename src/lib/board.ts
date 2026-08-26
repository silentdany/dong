import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { currentCents, snapshotFromPayments, type DecaySnapshot } from "@/lib/decay";
import { getSql } from "@/lib/db";
import {
  projectedRank,
  quoteAmount,
  toDollars,
  type RankRow,
} from "@/lib/ranking";
import { currentLeaderDollars } from "@/lib/leader";
import { parseTarget } from "@/lib/target";

export type ListingRow = {
  id: string;
  displayName: string;
  targetType: string;
  targetKey: string;
  targetUrl: string;
  description: string;
  allTimeCents: number;
  clickCount: number;
  createdAt: string;
  scoreCents: number;
  levelAtLastPay: number;
  lastPaidAt: string | null;
  peakCents: number;
};

type DbListing = {
  id: string;
  display_name: string;
  target_type: string;
  target_key: string;
  target_url: string;
  description: string;
  all_time_cents: number;
  click_count: number;
  created_at: string;
};

type DbPay = {
  listing_id: string;
  amount_cents: number;
  created_at: string;
};

function iso(value: string | Date): string {
  return typeof value === "string" ? value : new Date(value).toISOString();
}

function mapListing(row: DbListing, snap: DecaySnapshot, now = Date.now()): ListingRow {
  const createdAt = iso(row.created_at);
  const peakCents = Math.max(snap.peakCents, row.all_time_cents);
  return {
    id: row.id,
    displayName: row.display_name,
    targetType: row.target_type,
    targetKey: row.target_key,
    targetUrl: row.target_url,
    description: row.description,
    allTimeCents: row.all_time_cents,
    clickCount: row.click_count,
    createdAt,
    scoreCents: currentCents(snap, now),
    levelAtLastPay: snap.levelAtLastPay,
    lastPaidAt: snap.lastPaidAt,
    peakCents,
  };
}

function seedSnap(cents: number, hoursAgo: number): DecaySnapshot {
  const lastPaidAt = new Date(Date.now() - hoursAgo * 3600_000).toISOString();
  return { levelAtLastPay: cents, lastPaidAt, peakCents: cents };
}

/** Same rows as migrations/0004_jonathan.sql — used if Neon is not wired. */
function seedListings(): ListingRow[] {
  const rows: Array<{ hours: number } & Omit<ListingRow, "scoreCents" | "levelAtLastPay" | "lastPaidAt" | "peakCents" | "createdAt">> = [
    {
      id: "lst_jonathan",
      displayName: "Jonathan Wilke",
      targetType: "handle",
      targetKey: "handle:jonathan_wilke",
      targetUrl: "https://x.com/jonathan_wilke",
      description: "Started it. German average. You're welcome.",
      allTimeCents: 1500,
      clickCount: 0,
      hours: 0,
    },
  ];
  const now = Date.now();
  return rows.map((row) => {
    const { hours, ...rest } = row;
    const snap = seedSnap(row.allTimeCents, hours);
    return {
      ...rest,
      createdAt: snap.lastPaidAt!,
      scoreCents: currentCents(snap, now),
      levelAtLastPay: snap.levelAtLastPay,
      lastPaidAt: snap.lastPaidAt,
      peakCents: snap.peakCents,
    };
  });
}

function groupPays(pays: DbPay[]): Map<string, PayLike[]> {
  const map = new Map<string, PayLike[]>();
  for (const pay of pays) {
    const list = map.get(pay.listing_id) ?? [];
    list.push({ amountCents: pay.amount_cents, createdAt: iso(pay.created_at) });
    map.set(pay.listing_id, list);
  }
  return map;
}

type PayLike = { amountCents: number; createdAt: string };

function snapFor(row: DbListing, pays: PayLike[]): DecaySnapshot {
  if (pays.length) return snapshotFromPayments(pays);
  return snapshotFromPayments([{ amountCents: row.all_time_cents, createdAt: iso(row.created_at) }]);
}

async function hydrate(listings: DbListing[], pays: DbPay[]): Promise<ListingRow[]> {
  const grouped = groupPays(pays);
  const now = Date.now();
  return listings.map((row) => mapListing(row, snapFor(row, grouped.get(row.id) ?? []), now));
}

export const getBoard = createServerFn({ method: "GET" })
  .validator(z.object({ window: z.enum(["today", "all"]) }))
  .handler(async ({ data }) => {
    try {
    const sql = await getSql();
    const listings = await sql<DbListing>`
      select id, display_name, target_type, target_key, target_url, description,
             all_time_cents, click_count, created_at
      from listings
      where hidden = false and all_time_cents > 0
    `;
    const pays = await sql<DbPay>`
      select listing_id, amount_cents, created_at from payments
    `;
    let rows = await hydrate(listings, pays);
    if (data.window === "today") {
      const cutoff = Date.now() - 24 * 3600_000;
      rows = rows.filter((row) => {
        if (!row.lastPaidAt) return false;
        return new Date(row.lastPaidAt).getTime() >= cutoff && row.scoreCents > 0;
      });
    }
    rows.sort((a, b) => b.scoreCents - a.scoreCents || a.createdAt.localeCompare(b.createdAt));
    return rows.slice(0, 100);
    } catch {
      const rows = seedListings();
      if (data.window === "today") return rows.filter((row) => row.scoreCents > 0);
      return rows;
    }
  });

export const getLeader = createServerFn({ method: "GET" }).handler(async () => {
  try {
  const sql = await getSql();
  const listings = await sql<DbListing>`
    select id, display_name, target_type, target_key, target_url, description,
           all_time_cents, click_count, created_at
    from listings
    where hidden = false and all_time_cents > 0
  `;
  const pays = await sql<DbPay>`
    select listing_id, amount_cents, created_at from payments
  `;
  const rows = await hydrate(listings, pays);
  const top = rows.reduce((m, row) => Math.max(m, row.scoreCents), 0);
  return toDollars(top);
  } catch {
    const top = seedListings().reduce((m, row) => Math.max(m, row.scoreCents), 0);
    return toDollars(top);
  }
});

export const getListing = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    try {
    const sql = await getSql();
    const rows = await sql<DbListing>`
      select id, display_name, target_type, target_key, target_url, description,
             all_time_cents, click_count, created_at
      from listings
      where id = ${data.id} and hidden = false
      limit 1
    `;
    const row = rows[0];
    if (!row) return null;
    const pays = await sql<DbPay>`
      select listing_id, amount_cents, created_at from payments
      where listing_id = ${data.id}
    `;
    const [listing] = await hydrate([row], pays);
    return listing ?? null;
    } catch {
      return seedListings().find((row) => row.id === data.id) ?? null;
    }
  });

export const lookupListing = createServerFn({ method: "GET" })
  .validator(z.object({ target: z.string().min(1).max(200) }))
  .handler(async ({ data }) => {
    const parsed = parseTarget(data.target);
    if (!parsed) return null;
    try {
      const sql = await getSql();
      const rows = await sql<DbListing>`
        select id, display_name, target_type, target_key, target_url, description,
               all_time_cents, click_count, created_at
        from listings
        where target_key = ${parsed.key} and hidden = false
        limit 1
      `;
      const row = rows[0];
      if (!row) return null;
      const pays = await sql<DbPay>`
        select listing_id, amount_cents, created_at from payments
        where listing_id = ${row.id}
      `;
      const [listing] = await hydrate([row], pays);
      return listing ?? null;
    } catch {
      return (
        seedListings().find((row) => row.targetKey === parsed.key) ?? null
      );
    }
  });

export const searchListings = createServerFn({ method: "GET" })
  .validator(z.object({ q: z.string().min(1).max(80) }))
  .handler(async ({ data }) => {
    const q = data.q.trim();
    if (!q) return [];
    const like = `%${q.replace(/[%_]/g, "")}%`;
    try {
      const sql = await getSql();
      const parsed = parseTarget(q);
      const rows = parsed
        ? await sql<DbListing>`
            select id, display_name, target_type, target_key, target_url, description,
                   all_time_cents, click_count, created_at
            from listings
            where hidden = false and all_time_cents > 0 and (
              target_key = ${parsed.key}
              or display_name ilike ${like}
              or target_key ilike ${like}
              or target_url ilike ${like}
            )
            order by case when target_key = ${parsed.key} then 0 else 1 end,
                     all_time_cents desc, created_at asc
            limit 8
          `
        : await sql<DbListing>`
            select id, display_name, target_type, target_key, target_url, description,
                   all_time_cents, click_count, created_at
            from listings
            where hidden = false and all_time_cents > 0 and (
              display_name ilike ${like}
              or target_key ilike ${like}
              or target_url ilike ${like}
            )
            order by all_time_cents desc, created_at asc
            limit 8
          `;
      return rows.map((row) =>
        mapListing(row, {
          levelAtLastPay: row.all_time_cents,
          lastPaidAt: iso(row.created_at),
          peakCents: row.all_time_cents,
        }),
      );
    } catch {
      const needle = q.toLowerCase();
      return seedListings()
        .filter(
          (row) =>
            row.displayName.toLowerCase().includes(needle) ||
            row.targetKey.toLowerCase().includes(needle) ||
            row.targetUrl.toLowerCase().includes(needle),
        )
        .slice(0, 8);
    }
  });

const bidSchema = z.object({
  listingId: z.string().min(1).max(80).optional(),
  target: z.string().min(1).max(200),
  displayName: z.string().min(1).max(40),
  description: z.string().max(140).optional().default(""),
  amountDollars: z.number().int().min(1).max(1_000_000),
  returnPath: z.string().max(300).optional(),
  duelOpponentId: z.string().min(1).max(80).optional(),
});

export const quoteBid = createServerFn({ method: "POST" })
  .validator(bidSchema)
  .handler(async ({ data }) => {
    const parsed = parseTarget(data.target);
    if (!parsed) return { ok: false as const, code: "invalid-target" as const };

    try {
    const sql = await getSql();
    const existing = data.listingId
      ? await sql<DbListing>`
          select id, display_name, target_type, target_key, target_url, description,
                 all_time_cents, click_count, created_at
          from listings where id = ${data.listingId} limit 1
        `
      : await sql<DbListing>`
          select id, display_name, target_type, target_key, target_url, description,
                 all_time_cents, click_count, created_at
          from listings where target_key = ${parsed.key} limit 1
        `;
    const current = existing[0];
    if (data.listingId && !current) {
      return { ok: false as const, code: "listing-mismatch" as const };
    }
    if (current && current.target_key !== parsed.key) {
      return { ok: false as const, code: "listing-mismatch" as const };
    }
    const listings = await sql<DbListing>`
      select id, display_name, target_type, target_key, target_url, description,
             all_time_cents, click_count, created_at
      from listings where hidden = false and all_time_cents > 0
    `;
    const pays = await sql<DbPay>`
      select listing_id, amount_cents, created_at from payments
    `;
    const hydrated = await hydrate(listings, pays);
    const leaderDollars = await currentLeaderDollars(current?.id);
    const allRows: RankRow[] = hydrated.map((row) => ({
      id: row.id,
      allTimeCents: row.scoreCents,
      createdAt: row.createdAt,
    }));

    const currentDollars = toDollars(current?.all_time_cents ?? 0);
    const quoted = quoteAmount({
      amountDollars: data.amountDollars,
      currentDollars,
      leaderDollars,
      isNew: !current || current.all_time_cents <= 0,
    });
    if (!quoted.ok) {
      return { ok: false as const, ...quoted.error };
    }
    return {
      ok: true as const,
      chargeDollars: quoted.chargeDollars,
      currentDollars,
      projectedRank: projectedRank(data.amountDollars, allRows, current?.id),
      existingName: current?.display_name ?? null,
      listingId: current?.id ?? null,
      live: Boolean(process.env.STRIPE_SECRET_KEY?.trim()),
    };
    } catch {
      return { ok: false as const, code: "db-unavailable" as const };
    }
  });

export const startCheckout = createServerFn({ method: "POST" })
  .validator(bidSchema)
  .handler(async ({ data }) => {
    const { startCheckout: run } = await import("@/lib/pay");
    return run(data);
  });

export const fulfillPaidSession = createServerFn({ method: "GET" })
  .validator(z.object({ sessionId: z.string().min(1).max(200) }))
  .handler(async ({ data }) => {
    const { fulfillCheckoutSessionId } = await import("@/lib/pay");
    return fulfillCheckoutSessionId(data.sessionId);
  });

export const trackClick = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    try {
    const sql = await getSql();
    const rows = await sql<{ target_url: string }>`
      update listings set click_count = click_count + 1
      where id = ${data.id} and hidden = false
      returning target_url
    `;
    return rows[0]?.target_url ?? null;
    } catch {
      return seedListings().find((row) => row.id === data.id)?.targetUrl ?? null;
    }
  });
