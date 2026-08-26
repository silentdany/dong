import { Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { BidDrawer } from "@/components/bid-drawer";
import { BoardList } from "@/components/board-list";
import { Button } from "@/components/ui/button";
import type { ListingRow } from "@/lib/board";
import { copy } from "@/lib/copy";
import { costToTakeTop } from "@/lib/ranking";

type WindowName = "all" | "today";

export function BoardPage({
  windowName,
  entries,
  leader,
  paid,
  highlightId,
}: {
  windowName: WindowName;
  entries: ListingRow[];
  leader: number;
  paid?: string;
  highlightId?: string;
}) {
  const takeTop = costToTakeTop(leader);
  const today = windowName === "today";

  return (
    <AppShell footerPad>
      <div className="stagger-in flex flex-col gap-6">
        <div>
          <h1 className="font-display text-4xl leading-[1.05] tracking-tight text-fg sm:text-5xl">
            {today ? copy.todayTitle : copy.tagline}
          </h1>
          <p className="mt-2 text-sm font-medium text-fg">{today ? copy.todayKicker : copy.kicker}</p>
          <p className="mt-3 max-w-prose text-sm text-muted">
            {today ? copy.todayDescription : copy.description}
          </p>
          <p className="mt-4 text-sm font-medium text-fg">{copy.takeTop(takeTop)}</p>
        </div>

        {paid === "1" ? (
          <p className="rounded-md bg-surface px-3 py-3 text-sm text-muted">{copy.justPaid}</p>
        ) : null}

        <div className="flex rounded-md bg-surface p-1">
          <Button asChild variant={today ? "ghost" : "default"} className="h-11 flex-1">
            <Link to="/" aria-current={today ? undefined : "page"}>
              {copy.allTime}
            </Link>
          </Button>
          <Button asChild variant={today ? "default" : "ghost"} className="h-11 flex-1">
            <Link to="/today" aria-current={today ? "page" : undefined}>
              {copy.today}
            </Link>
          </Button>
        </div>

        <BoardList
          entries={entries}
          highlightId={highlightId}
          leaderDollars={leader}
          emptyText={today ? copy.todayEmpty : copy.empty}
        />
      </div>
      <BidDrawer leaderDollars={leader} />
    </AppShell>
  );
}
