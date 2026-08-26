/** 1 cm ($1) leaks every hour. Fractional so the bar can crawl; the number holds until the centimetre is gone. */
export const DECAY_CENTS_PER_HOUR = 100;

export type PayEvent = {
  amountCents: number;
  createdAt: string;
};

export type DecaySnapshot = {
  levelAtLastPay: number;
  lastPaidAt: string | null;
  peakCents: number;
};

export function hoursBetween(fromMs: number, toMs: number): number {
  return Math.max(0, toMs - fromMs) / 3_600_000;
}

export function leak(levelCents: number, fromMs: number, toMs: number): number {
  return Math.max(0, levelCents - hoursBetween(fromMs, toMs) * DECAY_CENTS_PER_HOUR);
}

export function snapshotFromPayments(events: PayEvent[]): DecaySnapshot {
  const sorted = [...events].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  let level = 0;
  let t = 0;
  let lastPaidAt: string | null = null;
  let peak = 0;
  for (const event of sorted) {
    const at = new Date(event.createdAt).getTime();
    if (!Number.isFinite(at)) continue;
    if (t) level = leak(level, t, at);
    level += Math.max(0, event.amountCents);
    peak = Math.max(peak, level);
    t = at;
    lastPaidAt = new Date(at).toISOString();
  }
  return { levelAtLastPay: level, lastPaidAt, peakCents: peak };
}

export function currentCents(snap: DecaySnapshot, now = Date.now()): number {
  if (!snap.lastPaidAt) return 0;
  const t = new Date(snap.lastPaidAt).getTime();
  if (!Number.isFinite(t)) return 0;
  return leak(snap.levelAtLastPay, t, now);
}

export function lostCents(snap: DecaySnapshot, now = Date.now()): number {
  return Math.max(0, snap.peakCents - currentCents(snap, now));
}
