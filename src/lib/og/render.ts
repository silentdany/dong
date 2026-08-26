import { Resvg, initWasm as initResvg } from "@resvg/resvg-wasm";
import resvgWasm from "@resvg/resvg-wasm/index_bg.wasm";
import type { ReactNode } from "react";
import satori, { init as initSatori } from "satori/standalone";
import yogaWasm from "satori/yoga.wasm";
import { CARD } from "@/lib/og/parts";
import { ogFonts } from "@/lib/og/fonts";

let ready: Promise<void> | null = null;

function ignoreAlready(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  if (/already/i.test(message)) return;
  throw err;
}

function wasmBytes(data: Buffer | Uint8Array | ArrayBuffer): Uint8Array {
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  return data;
}

function ensureEngines(): Promise<void> {
  if (!ready) {
    ready = Promise.all([
      initSatori(wasmBytes(yogaWasm)).catch(ignoreAlready),
      initResvg(wasmBytes(resvgWasm)).catch(ignoreAlready),
    ]).then(() => undefined);
  }
  return ready;
}

export async function card(element: ReactNode): Promise<Response> {
  try {
    await ensureEngines();
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
  } catch (err) {
    console.error("[og] render failed", err);
    throw err;
  }
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
