import { copy } from "@/lib/copy";
import { ogSite } from "@/lib/og/links";

export const SITE_ORIGIN = "https://epenis.lol";

export function canonical(path: string) {
  if (path === "/") return `${SITE_ORIGIN}/`;
  return `${SITE_ORIGIN}${path}`;
}

export function absOg(path: string): string {
  if (path.startsWith("http")) return path;
  return `${SITE_ORIGIN}${path}`;
}

export function seoHead({
  title,
  description,
  path,
  index = true,
  image,
  imageAlt,
}: {
  title: string;
  description: string;
  path: string;
  index?: boolean;
  image?: string;
  imageAlt?: string;
}) {
  const img = absOg(image ?? ogSite());
  const alt = imageAlt ?? title;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: canonical(path) },
      { property: "og:site_name", content: copy.siteName },
      { property: "og:image", content: img },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: alt },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: img },
      ...(index ? [] : [{ name: "robots", content: "noindex, nofollow" }]),
    ],
    links: index ? [{ rel: "canonical", href: canonical(path) }] : [],
  };
}

export function boardJsonLd(
  kind: "all" | "today",
  entries: Array<{ id: string; displayName: string }>,
) {
  const path = kind === "today" ? "/today" : "/";
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: copy.siteName,
        url: canonical("/"),
        description: copy.homeMetaDescription,
      },
      {
        "@type": "ItemList",
        name: kind === "today" ? "Today on epenis.lol" : "All-time board on epenis.lol",
        url: canonical(path),
        numberOfItems: entries.length,
        itemListElement: entries.slice(0, 20).map((row, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: row.displayName,
          url: canonical(`/l/${row.id}`),
        })),
      },
    ],
  };
}

/**
 * A listing page, described. These are the pages people link to — one per
 * paying listing, each already carrying a name, a rank and a price in its
 * markup — and they were the only pages emitting no structured data.
 */
export function listingJsonLd(listing: {
  id: string;
  displayName: string;
  description: string;
  cm: number;
  rank: number;
  targetUrl: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ListItem",
    position: listing.rank > 0 ? listing.rank : undefined,
    url: canonical(`/l/${listing.id}`),
    name: listing.displayName,
    description: listing.description || copy.listingMetaDescription(listing.displayName, ""),
    item: {
      "@type": "WebPage",
      url: listing.targetUrl,
      name: listing.displayName,
    },
  };
}

export function jsonLdScript(data: unknown) {
  return {
    type: "application/ld+json",
    children: JSON.stringify(data),
  };
}
