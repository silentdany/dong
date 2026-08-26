/** Fast public thumbnails: X avatars via unavatar, site icons via Google favicons. */
export function listingLogoUrl(type: string, key: string, url: string): string | null {
  if (type === "handle") {
    const handle = key.replace(/^handle:/, "").trim();
    if (!handle) return null;
    return `https://unavatar.io/x/${encodeURIComponent(handle)}`;
  }
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (!host) return null;
    return `https://www.google.com/s2/favicons?sz=128&domain=${encodeURIComponent(host)}`;
  } catch {
    return null;
  }
}

export function listingInitial(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const ch = trimmed.replace(/^@/, "")[0];
  return ch ? ch.toUpperCase() : "?";
}
