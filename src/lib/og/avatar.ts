import { listingLogoUrl } from "@/lib/logo";

/**
 * The face on a share card. Cards carry the target as a display label
 * (`@handle`, or a host), so the label is turned back into the same thumbnail
 * URL the board uses — one source of truth for where avatars come from.
 *
 * Satori fetches remote images itself, but a slow or dead host would then hang
 * or fail the whole card. Fetching here instead means a miss is just a missing
 * face: the lane falls back to an initial, exactly like the board does.
 */

const TIMEOUT_MS = 2500;
const MAX_BYTES = 512 * 1024;
/** Satori rasterizes these two reliably; anything else falls back to a letter. */
const USABLE = /^image\/(png|jpeg)$/;

export function logoUrlFromLabel(label: string): string | null {
  const value = label.trim();
  if (!value) return null;
  if (value.startsWith("@")) {
    const handle = value.slice(1).trim();
    return handle ? listingLogoUrl("handle", `handle:${handle}`, "") : null;
  }
  const url = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return listingLogoUrl("url", "", url);
}

/** A data URI for one image URL, or null — never throws, never blocks long. */
export async function fetchImageData(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal, redirect: "follow" });
    if (!response.ok) return null;
    const type = (response.headers.get("content-type") ?? "").split(";")[0].trim();
    if (!USABLE.test(type)) return null;
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.byteLength === 0 || bytes.byteLength > MAX_BYTES) return null;
    return `data:${type};base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** The avatar for a card's target label. */
export function logoData(label: string | undefined | null): Promise<string | null> {
  const url = label ? logoUrlFromLabel(label) : null;
  return url ? fetchImageData(url) : Promise.resolve(null);
}

/** Avatars for a whole board in one pass; a slow one cannot delay the others. */
export function logoDataAll(labels: (string | undefined | null)[]): Promise<(string | null)[]> {
  return Promise.all(labels.map((label) => logoData(label)));
}
