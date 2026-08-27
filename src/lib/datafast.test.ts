import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { datafastStripeMetadata } from "./datafast.ts";

describe("datafastStripeMetadata", () => {
  it("copies both DataFast cookies onto Stripe metadata", () => {
    const header =
      "datafast_visitor_id=vis_abc; datafast_session_id=ses_xyz; other=nope";
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
