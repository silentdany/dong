import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { currentCents, snapshotFromPayments } from "./decay.ts";
import { lengthCm } from "./ranking.ts";

const min = (n: number) => n * 60_000;

describe("lengthCm", () => {
  it("keeps a paid centimetre until a full $1 has leaked", () => {
    assert.equal(lengthCm(1000), 10);
    assert.equal(lengthCm(999), 10);
    assert.equal(lengthCm(901), 10);
    assert.equal(lengthCm(900), 9);
    assert.equal(lengthCm(1), 1);
    assert.equal(lengthCm(0), 0);
    assert.equal(lengthCm(-50), 0);
  });
});

describe("decay display", () => {
  it("does not drop a centimetre 14 or 30 minutes after a whole-dollar pay", () => {
    const paidAt = "2026-08-26T13:00:00.000Z";
    const snap = snapshotFromPayments([{ amountCents: 1000, createdAt: paidAt }]);
    const t = Date.parse(paidAt);
    assert.equal(lengthCm(currentCents(snap, t)), 10);
    assert.equal(lengthCm(currentCents(snap, t + min(14))), 10);
    assert.equal(lengthCm(currentCents(snap, t + min(30))), 10);
    assert.equal(lengthCm(currentCents(snap, t + min(59))), 10);
    assert.equal(lengthCm(currentCents(snap, t + min(60))), 9);
  });

  it("does not show −1 cm 14 minutes after stacked raises (Dany's board)", () => {
    const events = [
      { amountCents: 2000, createdAt: "2026-08-26T13:40:08.063Z" },
      { amountCents: 200, createdAt: "2026-08-26T14:06:02.589Z" },
      { amountCents: 100, createdAt: "2026-08-26T14:18:54.646Z" },
    ];
    const snap = snapshotFromPayments(events);
    const now = Date.parse("2026-08-26T14:33:00.000Z");
    const live = currentCents(snap, now);
    const lost = Math.max(0, lengthCm(snap.levelAtLastPay) - lengthCm(live));
    assert.equal(lengthCm(live), lengthCm(snap.levelAtLastPay));
    assert.equal(lost, 0);
    // Lifetime spend was $23; live length never reached that. Peak is live max.
    assert.ok(snap.peakCents < 2300);
    assert.ok(lengthCm(live) >= 22);
  });

  it("drops 1 cm one hour after the last payment, not from lifetime spend", () => {
    const paidAt = "2026-08-26T14:18:54.646Z";
    const snap = snapshotFromPayments([
      { amountCents: 2000, createdAt: "2026-08-26T13:40:08.063Z" },
      { amountCents: 200, createdAt: "2026-08-26T14:06:02.589Z" },
      { amountCents: 100, createdAt: paidAt },
    ]);
    const t = Date.parse(paidAt);
    const atPay = lengthCm(currentCents(snap, t));
    const hourLater = lengthCm(currentCents(snap, t + min(60)));
    assert.equal(atPay - hourLater, 1);
  });
});
