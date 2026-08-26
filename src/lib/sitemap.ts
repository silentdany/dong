import { getBoard } from "@/lib/board";
import { canonical } from "@/lib/seo";

function xml(value: string) {
  return value
    .replaceAll("&", `&${"amp"};`)
    .replaceAll("<", `&${"lt"};`)
    .replaceAll(">", `&${"gt"};`)
    .replaceAll('"', `&${"quot"};`)
    .replaceAll("'", `&${"apos"};`);
}

function urlTag(path: string, changefreq: string, priority: string, lastmod?: string) {
  const last = lastmod ? `<lastmod>${xml(lastmod)}</lastmod>` : "";
  return `<url><loc>${xml(canonical(path))}</loc>${last}<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
}

export async function renderSitemap() {
  const listings = await getBoard({ data: { window: "all" } });
  const staticUrls = [
    urlTag("/", "daily", "1.0"),
    urlTag("/today", "hourly", "0.8"),
    urlTag("/rules", "monthly", "0.3"),
    urlTag("/about", "monthly", "0.3"),
    urlTag("/terms", "yearly", "0.1"),
    urlTag("/privacy", "yearly", "0.1"),
    urlTag("/duel", "weekly", "0.4"),
  ];
  const listingUrls = listings.map((row) =>
    urlTag(`/l/${row.id}`, "daily", "0.6", (row.lastPaidAt ?? row.createdAt).slice(0, 10)),
  );
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...staticUrls,
    ...listingUrls,
    `</urlset>`,
  ].join("\n");
}
