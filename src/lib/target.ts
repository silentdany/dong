export type ParsedTarget =
  | { type: "handle"; key: string; url: string; label: string }
  | { type: "url"; key: string; url: string; label: string };

const HANDLE = /^@?([A-Za-z0-9_]{1,30})$/;

export function parseTarget(raw: string): ParsedTarget | null {
  const value = raw.trim();
  if (!value) return null;

  const handle = HANDLE.exec(value.replace(/^https?:\/\/(www\.)?(x|twitter)\.com\//i, "@"));
  if (handle && !value.includes(".") && !value.includes("/")) {
    const name = handle[1].toLowerCase();
    return {
      type: "handle",
      key: `handle:${name}`,
      url: `https://x.com/${handle[1]}`,
      label: `@${handle[1]}`,
    };
  }

  let url = value;
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    const host = parsed.hostname.replace(/^www\./, "");
    if (host === "x.com" || host === "twitter.com") {
      const name = parsed.pathname.split("/").filter(Boolean)[0];
      if (name && HANDLE.test(name)) {
        return {
          type: "handle",
          key: `handle:${name.toLowerCase()}`,
          url: `https://x.com/${name}`,
          label: `@${name}`,
        };
      }
    }
    const normalized = `https://${host}${parsed.pathname}`.replace(/\/$/, "");
    return {
      type: "url",
      key: `url:${normalized.toLowerCase()}`,
      url: normalized,
      label: host + (parsed.pathname !== "/" ? parsed.pathname : ""),
    };
  } catch {
    return null;
  }
}

export function displayTarget(type: string, key: string, url: string) {
  if (type === "handle") return `@${key.replace(/^handle:/, "")}`;
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "") + (parsed.pathname === "/" ? "" : parsed.pathname);
  } catch {
    return url;
  }
}
