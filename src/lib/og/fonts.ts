import plexBold from "./fonts/IBMPlexSans-Bold.ttf";
import plexSemi from "./fonts/IBMPlexSans-SemiBold.ttf";
import serif from "./fonts/InstrumentSerif-Regular.ttf";

export const SANS = "IBM Plex Sans";
export const SERIF = "Instrument Serif";

type Font = { name: string; data: Buffer; weight: 400 | 600 | 700; style: "normal" };

let cached: Font[] | null = null;

export function ogFonts(): Font[] {
  if (cached) return cached;
  cached = [
    { name: SANS, data: plexSemi, weight: 600, style: "normal" },
    { name: SANS, data: plexBold, weight: 700, style: "normal" },
    { name: SERIF, data: serif, weight: 400, style: "normal" },
  ];
  return cached;
}
