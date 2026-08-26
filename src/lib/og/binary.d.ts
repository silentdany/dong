declare module "*.ttf" {
  const data: Buffer;
  export default data;
}

declare module "*.wasm" {
  const data: Buffer;
  export default data;
}

declare module "satori/yoga.wasm" {
  const data: Buffer;
  export default data;
}

declare module "@resvg/resvg-wasm/index_bg.wasm" {
  const data: Buffer;
  export default data;
}

declare module "virtual:og-hb-wasm" {
  const data: Buffer;
  export default data;
}

declare module "harfbuzzjs/hb.js" {
  const createHarfBuzz: (moduleArg?: { wasmBinary?: Uint8Array }) => Promise<unknown>;
  export default createHarfBuzz;
}

declare module "harfbuzzjs/hbjs.js" {
  const hbjs: (instance: unknown) => unknown;
  export default hbjs;
}
