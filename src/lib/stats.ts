import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { datafastStats } from "@/lib/datafast";
import { getSql } from "@/lib/db";

/**
 * The numbers under the board: who is here, how many have ever been, and how
 * many clicks the paid listings have earned.
 *
 * Presence is a heartbeat, not a socket. A card of live counters is not worth
 * holding a serverless function open per viewer — the page already polls, so
 * the ping rides along with it and costs one upsert.
 */

/** A browser counts as online for this long after its last ping. */
const ONLINE_SECONDS = 120;

export type LiveStats = {
  online: number;
  visitors: number;
  clicks: number;
};

const EMPTY: LiveStats = { online: 0, visitors: 0, clicks: 0 };

/**
 * The heartbeat has to be per-viewer, but the counters do not: `count(*)` over
 * every visitor ever is a scan, and running one per ping would make the numbers
 * cost more the better the site does. Read them once every few seconds and let
 * every viewer in that window share the answer.
 */
const READ_TTL_MS = 5_000;
let cached: { at: number; stats: LiveStats } | null = null;

/** Opaque, browser-generated, stored client-side. Never linked to a listing. */
const visitorId = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9_-]{8,64}$/)
  .optional();

export const pulse = createServerFn({ method: "POST" })
  .validator(z.object({ id: visitorId }))
  .handler(async ({ data }): Promise<LiveStats> => {
    try {
      const sql = await getSql();

      if (data.id) {
        await sql`
          insert into visitors (id, first_seen, last_seen)
          values (${data.id}, now(), now())
          on conflict (id) do update set last_seen = now()
        `;
      }

      const fresh = cached && Date.now() - cached.at < READ_TTL_MS;
      if (fresh && cached) return cached.stats;

      // One round trip: both visitor counters and the click total.
      const rows = await sql<{ online: number; visitors: number; clicks: number }>`
        select
          (select count(*) from visitors
             where last_seen > now() - make_interval(secs => ${ONLINE_SECONDS})) as online,
          (select count(*) from visitors) as visitors,
          (select coalesce(sum(click_count), 0) from listings where hidden = false) as clicks
      `;
      const row = rows[0];
      // DataFast counts visitors for a living and filters bots; our own table
      // only counts browsers that kept their id, and only while they are on a
      // page that pings. Prefer theirs for both people-numbers, keep ours as the
      // fallback so the pill still reads when the key is unset or they are down.
      // Clicks are ours either way — DataFast never sees the outbound hop.
      const vendor = await datafastStats();
      const stats = row
        ? {
            online: vendor.online ?? Number(row.online),
            visitors: vendor.visitors ?? Number(row.visitors),
            clicks: Number(row.clicks),
          }
        : EMPTY;
      cached = { at: Date.now(), stats };
      return stats;
    } catch {
      // A counter is decoration. It must never take the page down with it.
      return EMPTY;
    }
  });
