import createHarfBuzz from "harfbuzzjs/hb.js";
import hbjs from "harfbuzzjs/hbjs.js";
import hbWasm from "virtual:og-hb-wasm";

/**
 * satori 0.33 imports `harfbuzzjs`, whose Emscripten glue reads `hb.wasm`
 * via CJS `__dirname`. The Nitro/ESM Vercel bundle has neither, so every
 * share card 500s. Instantiate from inlined bytes (not a .wasm import —
 * Nitro's unwasm plugin cannot parse this module).
 */
function wasmBinary(data: Buffer | Uint8Array | ArrayBuffer): Uint8Array {
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  return data;
}

type HbFactory = (moduleArg?: { wasmBinary?: Uint8Array }) => Promise<unknown>;
type HbJs = (instance: unknown) => unknown;

function interop<T>(mod: T | { default: T }): T {
  if (mod && typeof mod === "object" && "default" in mod && (mod as { default: T }).default) {
    return (mod as { default: T }).default;
  }
  return mod as T;
}

const ready = Promise.resolve(interop<HbFactory>(createHarfBuzz)({ wasmBinary: wasmBinary(hbWasm) })).then(
  (instance) => interop<HbJs>(hbjs)(instance),
);

export default ready;
