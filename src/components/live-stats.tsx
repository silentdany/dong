import { useEffect, useState } from "react";
import { copy } from "@/lib/copy";
import { pulse, type LiveStats } from "@/lib/stats";

/** How often a tab says it is still here. Also how fresh the counters stay. */
const PULSE_MS = 30_000;
const STORAGE_KEY = "epenis:visitor";

/** Opaque, per-browser, generated locally — it identifies a tab, not a person. */
function visitorId(): string | undefined {
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing && /^[A-Za-z0-9_-]{8,64}$/.test(existing)) return existing;
    const fresh = crypto.randomUUID().replace(/-/g, "");
    window.localStorage.setItem(STORAGE_KEY, fresh);
    return fresh;
  } catch {
    // Private mode, blocked storage: still ping, just without continuity.
    return undefined;
  }
}

export function LiveStatsPill({ href }: { href?: string }) {
  const [stats, setStats] = useState<LiveStats | null>(null);

  useEffect(() => {
    let alive = true;
    const id = visitorId();

    const beat = async () => {
      // A hidden tab is not a viewer, and should not hold a slot in the count.
      if (document.visibilityState !== "visible") return;
      try {
        const next = await pulse({ data: { id } });
        if (alive) setStats(next);
      } catch {
        // Leave the last good numbers up rather than blanking the pill.
      }
    };

    void beat();
    const timer = window.setInterval(() => void beat(), PULSE_MS);
    document.addEventListener("visibilitychange", beat);
    return () => {
      alive = false;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", beat);
    };
  }, []);

  // Nothing until the first pulse lands: a pill reading "0 online" is a lie
  // about the board, and a skeleton for one line of text is worse than a gap.
  if (!stats) return null;

  return (
    <div
      className="flex items-center justify-center rounded-full bg-surface px-4 py-2 text-xs text-muted"
      aria-live="polite"
    >
      <span className="relative mr-2 flex size-2 shrink-0" aria-hidden>
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-fill opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-fill" />
      </span>
      <span className="truncate">
        <span className="font-medium tabular-nums text-fg">{copy.stats.online(stats.online)}</span>
        <span aria-hidden> · </span>
        <span className="tabular-nums">{copy.stats.visitors(stats.visitors)}</span>
        <span aria-hidden> · </span>
        <span className="tabular-nums">{copy.stats.clicks(stats.clicks)}</span>
        {href ? (
          <>
            <span aria-hidden> · </span>
            <a
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className="text-muted underline decoration-border underline-offset-2 transition-colors duration-150 hover:text-fg"
            >
              {copy.stats.seeStats}
              <span aria-hidden>→</span>
            </a>
          </>
        ) : null}
      </span>
    </div>
  );
}
