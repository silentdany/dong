import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { datafastStripeMetadata } from "./datafast.ts";

describe("datafastStripeMetadata", () => {
  it("copies both DataFast cookies onto Stripe metadata", () => {
    const header = "datafast_visitor_id=vis_abc; datafast_session_id=ses_xyz; other=nope";
    assert.deepEqual(datafastStripeMetadata(header), {
      datafast_visitor_id: "vis_abc",
      datafast_session_id: "ses_xyz",
    });
  });

  it("omits missing cookies so checkout still works on a first hit", () => {
    assert.deepEqual(datafastStripeMetadata(null), {});
    assert.deepEqual(datafastStripeMetadata(""), {});
    assert.deepEqual(datafastStripeMetadata("theme=dark"), {});
  });

  it("keeps a lone cookie instead of dropping the pair", () => {
    assert.deepEqual(datafastStripeMetadata("datafast_visitor_id=vis_only"), {
      datafast_visitor_id: "vis_only",
    });
  });

  it("decodes a percent-encoded cookie value", () => {
    const header = "datafast_session_id=ses%2Fone";
    assert.equal(datafastStripeMetadata(header).datafast_session_id, "ses/one");
  });
});

/**
 * One live read per process: the module caches per instance, so a second call
 * would be answered from that cache rather than from the stub. Asserting the
 * whole request in a single pass is what that buys, and it is the part worth
 * locking down: the URLs, and the two layers of wrapping between the response
 * and the number.
 */
describe("datafastStats", () => {
  it("reads realtime and overview, and tolerates both response shapes", async () => {
    const calls: Array<{ url: string; auth: unknown }> = [];
    const realFetch = globalThis.fetch;
    const realKey = process.env.DATAFAST_API_KEY;

    globalThis.fetch = (async (input: unknown, init: RequestInit | undefined) => {
      const url = String(input);
      calls.push({ url, auth: (init?.headers as Record<string, string>)?.authorization });
      // Production answers `{"status":"success","data":[{…}]}`. Reading the
      // field off the envelope instead of the row inside it is what made the
      // pill show local counters while claiming to show DataFast's. The bare
      // array below covers the unwrapped shape, and the string covers a number
      // that does not arrive as one.
      const body = url.includes("/realtime")
        ? { status: "success", data: [{ visitors: 291, pageviews: 900 }] }
        : [{ visitors: "1366929", sessions: 2000 }];
      return new Response(JSON.stringify(body), { status: 200 });
    }) as typeof fetch;
    process.env.DATAFAST_API_KEY = "df_test_key";

    try {
      const { datafastStats } = await import("./datafast.ts");
      assert.deepEqual(await datafastStats(), { online: 291, visitors: 1366929 });

      assert.equal(calls.length, 2);
      assert.ok(calls.every((c) => c.auth === "Bearer df_test_key"));
      assert.ok(calls.some((c) => c.url === "https://datafa.st/api/v1/analytics/realtime"));
      const overview = calls.find((c) => c.url.includes("/analytics/overview"));
      assert.ok(overview, "expected an overview read");
      // A start date is required: the range default is undocumented, so without
      // it "since launch" would be whatever window they happen to pick.
      assert.match(overview.url, /startAt=\d{4}-\d{2}-\d{2}/);
      assert.match(overview.url, /endAt=\d{4}-\d{2}-\d{2}/);
    } finally {
      globalThis.fetch = realFetch;
      if (realKey === undefined) delete process.env.DATAFAST_API_KEY;
      else process.env.DATAFAST_API_KEY = realKey;
    }
  });
});
