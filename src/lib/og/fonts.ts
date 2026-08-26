import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const SANS = "IBM Plex Sans";
export const SERIF = "Instrument Serif";

type Font = { name: string; data: Buffer; weight: 400 | 600 | 700; style: "normal" };

const DIR = dirname(fileURLToPath(import.meta.url));

function load(name: string): Buffer {
  const candidates = [
    join(DIR, "fonts", name),
    join(process.cwd(), "src/lib/og/fonts", name),
    join(process.cwd(), "public/og-fonts", name),
  ];
  for (const path of candidates) {
    if (existsSync(path)) return readFileSync(path);
  }
  throw new Error(`og font missing: ${name}`);
}

let cached: Font[] | null = null;

export function ogFonts(): Font[] {
  if (cached) return cached;
  cached = [
    { name: SANS, data: load("IBMPlexSans-SemiBold.ttf"), weight: 600, style: "normal" },
    { name: SANS, data: load("IBMPlexSans-Bold.ttf"), weight: 700, style: "normal" },
    { name: SERIF, data: load("InstrumentSerif-Regular.ttf"), weight: 400, style: "normal" },
  ];
  return cached;
}
