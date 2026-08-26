import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { Resvg, initWasm } from "@resvg/resvg-wasm";
import type { ReactNode } from "react";
import satori from "satori";
import { CARD } from "@/lib/og/parts";
import { ogFonts } from "@/lib/og/fonts";

const require = createRequire(import.meta.url);

let wasmReady: Promise<void> | null = null;

function ensureWasm(): Promise<void> {
  if (!wasmReady) {
    wasmReady = readFile(require.resolve("@resvg/resvg-wasm/index_bg.wasm"))
      .then((buf) => initWasm(buf))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        if (message.toLowerCase().includes("already initialized")) return;
        wasmReady = null;
        throw err;
      });
  }
  return wasmReady;
}

export async function card(element: ReactNode): Promise<Response> {
  await ensureWasm();
  const svg = await satori(element as Parameters<typeof satori>[0], {
    width: CARD.width,
    height: CARD.height,
    fonts: ogFonts(),
  });
  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: CARD.width },
  })
    .render()
    .asPng();
  return new Response(Buffer.from(png), {
    headers: {
      "content-type": "image/png",
      "cache-control": "public, max-age=300, s-maxage=300",
    },
  });
}

export function n(params: URLSearchParams, key: string, fallback = 0): number {
  const raw = params.get(key);
  if (raw === null || raw.trim() === "") return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

export function s(params: URLSearchParams, key: string, fallback = ""): string {
  return params.get(key)?.trim() || fallback;
}

export function ratio(part: number, whole: number): number {
  if (whole <= 0) return part > 0 ? 1 : 0;
  return Math.min(1, Math.max(0, part / whole));
}
