import { copy } from "@/lib/copy";

export const SITE_ORIGIN = "https://epenis.lol";

export function canonical(path: string) {
  if (path === "/") return `${SITE_ORIGIN}/`;
  return `${SITE_ORIGIN}${path}`;
}

export function seoHead({
  title,
  description,
  path,
  index = true,
}: {
  title: string;
  description: string;
  path: string;
  index?: boolean;
}) {
  return {
    meta: [
      { title },
      { name: "description", content: description },
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

export function jsonLdScript(data: unknown) {
  return {
    type: "application/ld+json",
    children: JSON.stringify(data),
  };
}
