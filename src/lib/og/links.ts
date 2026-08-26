import { copy } from "../copy.ts";
import { lengthCm } from "../ranking.ts";
import { displayTarget } from "../target.ts";

type Value = string | number | undefined;

function query(base: string, params: Record<string, Value>, repeated: [string, string][] = []): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "" || value === 0) continue;
    search.set(key, String(value));
  }
  for (const [key, value] of repeated) search.append(key, value);
  const qs = search.toString();
  return qs ? `${base}?${qs}` : base;
}

function field(text: string): string {
  return text.replace(/~/g, "-").trim();
}

export type OgSide = { name: string; cm: number; target?: string };

export function ogSideFromListing(row: {
  displayName: string;
  scoreCents: number;
  targetType: string;
  targetKey: string;
  targetUrl: string;
}): OgSide {
  return {
    name: row.displayName,
    cm: lengthCm(row.scoreCents),
    target: displayTarget(row.targetType, row.targetKey, row.targetUrl),
  };
}

export const ogSite = (): string => "/og";

export const ogText = (input: { tag?: string; title: string; sub?: string }): string =>
  query("/og/text", { tag: input.tag, title: input.title, sub: input.sub });

export const ogListing = (input: {
  name: string;
  target?: string;
  cm: number;
  rank?: number;
  ratio?: number;
  badge?: string;
  desc?: string;
  takeTop?: number;
}): string =>
  query("/og/listing", {
    name: input.name,
    target: input.target,
    cm: input.cm,
    rank: input.rank,
    ratio: input.ratio === undefined ? undefined : Number(input.ratio.toFixed(4)),
    badge: input.badge,
    desc: input.desc,
    takeTop: input.takeTop,
  });

export const ogBoard = (input: { kind: "today" | "all-time"; rows: OgSide[]; takeTop?: number }): string =>
  query(
    "/og/board",
    { kind: input.kind, takeTop: input.takeTop },
    input.rows.slice(0, 4).map((row) => ["r", [field(row.name), row.cm, field(row.target ?? "")].join("~")]),
  );

export const ogDuel = (input: { a: OgSide; b: OgSide; flip?: number; tag?: string }): string =>
  query("/og/duel", {
    a: input.a.name,
    acm: input.a.cm,
    ah: input.a.target,
    b: input.b.name,
    bcm: input.b.cm,
    bh: input.b.target,
    flip: input.flip,
    tag: input.tag,
  });

export function ogAltBoard(leader: string, cm: number) {
  return `${leader} leads ${copy.siteName} at ${cm} cm.`;
}

export function ogAltListing(name: string, cm: number) {
  return `${name} measures ${cm} cm on ${copy.siteName}.`;
}

export function ogAltDuel(a: string, b: string) {
  return `${a} vs ${b} on ${copy.siteName}.`;
}

export function ogAltText(title: string) {
  return `${title} — ${copy.siteName}`;
}
