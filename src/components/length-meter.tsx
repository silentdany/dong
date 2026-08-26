import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { copy } from "@/lib/copy";
import { currentCents, type DecaySnapshot } from "@/lib/decay";
import { lengthCm } from "@/lib/ranking";
import { cn } from "@/lib/utils";

type Tier = "king" | "court" | "jester";

type Props = {
  snap: DecaySnapshot;
  now: number;
  maxCents: number;
  featured?: boolean;
  rank?: number;
};

function tierFromRank(rank: number | undefined, featured?: boolean): Tier {
  if (rank === 1 || (featured && rank == null)) return "king";
  if (rank === 2 || rank === 3) return "court";
  return "jester";
}

const TIER = {
  king: {
    bar: "h-7",
    halo: "size-10",
    haloAt: "left-3.5",
    number: "text-5xl sm:text-6xl",
    logo: "text-4xl sm:text-5xl",
    arrow: 14,
    minW: 40,
  },
  court: {
    bar: "h-5",
    halo: "size-7",
    haloAt: "left-2.5",
    number: "text-3xl sm:text-4xl",
    logo: "text-2xl",
    arrow: 12,
    minW: 32,
  },
  jester: {
    bar: "h-3.5",
    halo: "size-5",
    haloAt: "left-1.5",
    number: "text-xl sm:text-2xl",
    logo: "text-lg",
    arrow: 10,
    minW: 24,
  },
} as const;

export function LengthMeter({ snap, now, maxCents, featured, rank }: Props) {
  const live = currentCents(snap, now);
  const peak = Math.max(snap.peakCents, live);
  const scale = Math.max(maxCents, peak, 1);
  const liveRatio = Math.min(1, live / scale);
  const peakRatio = Math.min(1, peak / scale);
  const lostCm = Math.max(0, lengthCm(snap.levelAtLastPay) - lengthCm(live));
  const label = copy.unitLabel(lengthCm(live));
  const [grown, setGrown] = useState(false);
  const t = TIER[tierFromRank(rank, featured)];

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setGrown(true);
      return;
    }
    const frame = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const fillWidth = grown ? `${liveRatio * 100}%` : "0%";
  const ghostWidth = grown ? `${peakRatio * 100}%` : "0%";
  const showTip = grown && live > 0;
  const showLost = grown && peak > live;

  return (
    <div className="w-full">
      <p
        className={cn(
          "flex items-baseline gap-2 font-display leading-none tracking-tight tabular-nums text-fg",
          t.number,
        )}
      >
        <span className={cn("select-none leading-none", t.logo)} aria-hidden>
          {copy.logo}
        </span>
        <span>{label}</span>
        {lostCm > 0 ? (
          <span className="text-sm font-sans font-medium tracking-normal text-danger sm:text-base">
            −{lostCm} cm
          </span>
        ) : null}
      </p>

      <div className="relative mt-3 w-full">
        <div
          className={cn("relative w-full overflow-visible", t.bar)}
          role="img"
          aria-label={lostCm > 0 ? `${label}, down ${lostCm} cm` : label}
        >
          <div className="absolute inset-0 rounded-full bg-track" />

          <div
            className="absolute top-0 left-0 h-full rounded-full bg-fill/25"
            style={{
              width: ghostWidth,
              minWidth: showLost ? t.minW + 12 : 0,
              transition: "width 1s linear",
            }}
          />

          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fill/15 ring-1 ring-fill/25",
              t.halo,
              t.haloAt,
              showTip ? "opacity-100" : "opacity-0",
            )}
            style={{ transition: "opacity 420ms ease-out" }}
          />

          <div
            className="absolute top-0 left-0 flex h-full min-w-0 items-center justify-end overflow-hidden rounded-full bg-fill"
            style={{
              width: fillWidth,
              minWidth: showTip ? t.minW : 0,
              transition: "width 1s linear",
            }}
          >
            {showTip ? (
              <ArrowRight
                aria-hidden
                className="mr-1 shrink-0 text-bg"
                strokeWidth={2.75}
                size={t.arrow}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
