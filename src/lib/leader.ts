import { currentCents, snapshotFromPayments } from "@/lib/decay";
import { getSql } from "@/lib/db";
import { lengthCm } from "@/lib/ranking";

type PayRow = { listing_id: string; amount_cents: number; created_at: string };
type ListingRow = { id: string; all_time_cents: number; created_at: string };

function iso(value: string | Date): string {
  return typeof value === "string" ? value : new Date(value).toISOString();
}

/** Current on-board length of whoever is longest, excluding `excludeId`. */
export async function currentLeaderDollars(excludeId?: string): Promise<number> {
  const sql = await getSql();
  const listings = await sql<ListingRow>`
    select id, all_time_cents, created_at from listings where hidden = false
  `;
  const pays = await sql<PayRow>`
    select listing_id, amount_cents, created_at from payments
  `;
  const grouped = new Map<string, { amountCents: number; createdAt: string }[]>();
  for (const pay of pays) {
    const list = grouped.get(pay.listing_id) ?? [];
    list.push({ amountCents: pay.amount_cents, createdAt: iso(pay.created_at) });
    grouped.set(pay.listing_id, list);
  }
  const now = Date.now();
  let max = 0;
  for (const row of listings) {
    if (excludeId && row.id === excludeId) continue;
    const events = grouped.get(row.id);
    const snap = events?.length
      ? snapshotFromPayments(events)
      : snapshotFromPayments([{ amountCents: row.all_time_cents, createdAt: iso(row.created_at) }]);
    max = Math.max(max, currentCents(snap, now));
  }
  return lengthCm(max);
}
