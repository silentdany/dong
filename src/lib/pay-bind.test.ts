import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertListingMatchesTarget,
  checkoutReturnPath,
  expectedChargeMatchesPaid,
  listingIdFromStripeSession,
  parseChargeCents,
  safeReturnPath,
} from "./pay-bind.ts";

describe("listingIdFromStripeSession", () => {
  it("credits the metadata listing, not the other duel participant", () => {
    const session = {
      metadata: {
        listingId: "lst_bob",
        returnPath: "/duel/lst_alice/lst_bob",
      },
      client_reference_id: "lst_bob",
      amount_total: 500,
    };
    assert.equal(listingIdFromStripeSession(session), "lst_bob");
    assert.notEqual(listingIdFromStripeSession(session), "lst_alice");
  });

  it("never falls back to duel left/right metadata", () => {
    const session = {
      metadata: {
        left: "lst_alice",
        right: "lst_bob",
      },
    };
    assert.equal(listingIdFromStripeSession(session), null);
  });

  it("ignores a success URL that contains both duel ids", () => {
    const session = {
      metadata: {
        listingId: "lst_fourth",
        returnPath: "/duel/lst_founder/lst_fourth",
      },
    };
    assert.equal(listingIdFromStripeSession(session), "lst_fourth");
  });

  it("uses client_reference_id only when listingId metadata is missing", () => {
    assert.equal(
      listingIdFromStripeSession({ client_reference_id: "lst_bob" }),
      "lst_bob",
    );
    assert.equal(
      listingIdFromStripeSession({
        metadata: { listingId: "lst_alice" },
        client_reference_id: "lst_bob",
      }),
      "lst_alice",
    );
  });
});

describe("assertListingMatchesTarget", () => {
  it("rejects a checkout that names the opponent", () => {
    const result = assertListingMatchesTarget({
      listingId: "lst_bob",
      listingTargetKey: "handle:bob",
      requestedListingId: "lst_bob",
      requestedTargetKey: "handle:alice",
    });
    assert.equal(result.ok, false);
  });

  it("rejects a swapped listing id", () => {
    const result = assertListingMatchesTarget({
      listingId: "lst_bob",
      listingTargetKey: "handle:bob",
      requestedListingId: "lst_alice",
      requestedTargetKey: "handle:bob",
    });
    assert.equal(result.ok, false);
  });

  it("accepts a matching raise", () => {
    const result = assertListingMatchesTarget({
      listingId: "lst_bob",
      listingTargetKey: "handle:bob",
      requestedListingId: "lst_bob",
      requestedTargetKey: "handle:bob",
    });
    assert.equal(result.ok, true);
  });
});

describe("checkout return path", () => {
  it("keeps the paid listing in the query, never as a credit source", () => {
    const path = checkoutReturnPath({
      listingId: "lst_bob",
      returnPath: "/duel/lst_alice/lst_bob",
    });
    assert.equal(path, "/duel/lst_alice/lst_bob?paid=1&l=lst_bob");
  });

  it("builds a duel return that still credits via listing id", () => {
    const path = checkoutReturnPath({
      listingId: "lst_new",
      duelOpponentId: "lst_founder",
    });
    assert.equal(path, "/duel/lst_new/lst_founder?paid=1&l=lst_new");
  });

  it("rejects protocol-relative and off-site return paths", () => {
    assert.equal(safeReturnPath("//evil.example", "lst_bob"), "/?paid=1&l=lst_bob");
    assert.equal(safeReturnPath("https://evil.example", "lst_bob"), "/?paid=1&l=lst_bob");
  });

  it("returns to today after a payment started there", () => {
    assert.equal(safeReturnPath("/today", "lst_bob"), "/today?paid=1&l=lst_bob");
  });
});

describe("charge amount", () => {
  it("refuses to credit a paid total that is not the quoted charge", () => {
    assert.equal(expectedChargeMatchesPaid(500, 500), true);
    assert.equal(expectedChargeMatchesPaid(600, 500), false);
    assert.equal(expectedChargeMatchesPaid(0, 500), false);
    assert.equal(parseChargeCents({ chargeCents: "500" }), 500);
    assert.equal(parseChargeCents({ chargeCents: "-5" }), null);
  });
});
