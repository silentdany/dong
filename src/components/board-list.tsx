import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { DuelLaunch } from "@/components/duel-launch";
import { LengthMeter } from "@/components/length-meter";
import { ListingLogo } from "@/components/listing-logo";
import { badgeFor, copy } from "@/lib/copy";
import type { ListingRow } from "@/lib/board";
import { currentCents } from "@/lib/decay";
import { useNow } from "@/lib/use-now";
import { toDollars } from "@/lib/ranking";
import { displayTarget } from "@/lib/target";
import { cn } from "@/lib/utils";

function relativeTime(iso: string) {
  const then = new Date(iso).getTime();
  const delta = Math.max(0, Date.now() - then);
  const minutes = Math.floor(delta / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function RankIndex({ rank }: { rank: number }) {
  return (
    <span
      className={cn(
        "w-7 shrink-0 tabular-nums leading-none",
        rank === 1 && "font-display text-3xl text-fill-text",
        rank === 2 && "pt-0.5 font-display text-2xl text-fg",
        rank === 3 && "pt-0.5 font-display text-xl text-muted",
        rank > 3 && "pt-1 text-xs font-medium text-subtle",
      )}
      aria-label={`Rank ${rank}`}
    >
      {rank}
    </span>
  );
}

type Props = {
  entries: ListingRow[];
  highlightId?: string;
  leaderDollars: number;
  emptyText?: string;
};

export function BoardList({ entries, highlightId, leaderDollars, emptyText }: Props) {
  const now = useNow(1000);
  const [duelVs, setDuelVs] = useState<ListingRow | null>(null);
  if (entries.length === 0) {
    return <p className="px-2 py-16 text-center text-sm text-muted">{emptyText ?? copy.empty}</p>;
  }

  const live = entries
    .map((entry) => ({
      entry,
      current: currentCents(
        {
          levelAtLastPay: entry.levelAtLastPay,
          lastPaidAt: entry.lastPaidAt,
          peakCents: entry.peakCents,
        },
        now,
      ),
    }))
    .sort((a, b) => b.current - a.current || a.entry.createdAt.localeCompare(b.entry.createdAt));

  const maxCents = Math.max(1, ...live.map((row) => Math.max(row.entry.peakCents, row.current)));

  return (
    <>
      <ol className="flex flex-col gap-2">
        {live.map(({ entry, current }, index) => {
          const rank = index + 1;
          const first = rank === 1;
          const snap = {
            levelAtLastPay: entry.levelAtLastPay,
            lastPaidAt: entry.lastPaidAt,
            peakCents: entry.peakCents,
          };
          return (
            <li
              key={entry.id}
              className={cn(
                "relative rounded-lg bg-surface p-4",
                first && "bg-elevated p-5 ring-1 ring-fill/40",
                highlightId === entry.id && "ring-2 ring-accent",
              )}
            >
              {/*
                The card is the ad. Clicking it goes where the listing paid to
                send you — an overlay rather than a wrapper, because the row
                also holds a link and a button, and an anchor cannot nest.
              */}
              <a
                href={`/out/${entry.id}`}
                rel="nofollow noopener sponsored"
                aria-label={copy.visit(displayTarget(entry.targetType, entry.targetKey, entry.targetUrl))}
                className="absolute inset-0 z-0 rounded-lg"
              />
              <div className="flex items-start gap-3">
                <RankIndex rank={rank} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2 text-fg">
                      <ListingLogo
                        type={entry.targetType}
                        targetKey={entry.targetKey}
                        targetUrl={entry.targetUrl}
                        name={entry.displayName}
                        size={first ? "md" : "sm"}
                      />
                      <span
                        className={cn(
                          "min-w-0 truncate font-medium",
                          first && "font-display text-xl tracking-tight",
                        )}
                      >
                        {entry.displayName}
                      </span>
                    </div>
                    <span className="mt-0.5 max-w-[7.5rem] shrink-0 truncate text-right text-xs text-muted">
                      {badgeFor(current)}
                    </span>
                  </div>

                  {entry.description ? (
                    <p className="mt-1 line-clamp-1 text-sm text-muted">{entry.description}</p>
                  ) : null}

                  <div className="mt-3">
                    <LengthMeter snap={snap} now={now} maxCents={maxCents} rank={rank} featured={first} />
                  </div>

                  <p className="mt-3 truncate text-xs text-subtle">
                    <span className="tabular-nums text-muted">${toDollars(entry.allTimeCents)} paid</span>
                    <span aria-hidden> · </span>
                    <span className="text-muted">
                      {displayTarget(entry.targetType, entry.targetKey, entry.targetUrl)}
                    </span>
                    <span aria-hidden> · </span>
                    <span>{relativeTime(entry.lastPaidAt ?? entry.createdAt)}</span>
                    {entry.clickCount > 0 ? (
                      <>
                        <span aria-hidden> · </span>
                        <span className="tabular-nums">{copy.clicks(entry.clickCount)}</span>
                      </>
                    ) : null}
                  </p>

                  <div className="relative z-10 mt-1 flex w-fit items-center gap-4 text-sm">
                    <Link
                      to="/l/$id"
                      params={{ id: entry.id }}
                      className="inline-block py-1.5 font-medium text-accent underline-offset-2 hover:underline"
                    >
                      {copy.raiseMark} {copy.raise}
                    </Link>
                    <button
                      type="button"
                      className="inline-block py-1.5 font-medium text-fg underline-offset-2 hover:underline"
                      onClick={() => setDuelVs(entry)}
                    >
                      {copy.duelMark} {copy.duel}
                    </button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      {duelVs ? (
        <DuelLaunch
          opponent={duelVs}
          leaderDollars={leaderDollars}
          listings={entries}
          open
          onOpenChange={(open) => {
            if (!open) setDuelVs(null);
          }}
        />
      ) : null}
    </>
  );
}
