import { useEffect, useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { Drawer } from "vaul";
import { BidForm } from "@/components/bid-form";
import { ListingLogo } from "@/components/listing-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getListing, searchListings } from "@/lib/board";
import type { ListingRow } from "@/lib/board";
import { copy } from "@/lib/copy";
import { cn } from "@/lib/utils";

const SELF_KEY = "epenis-self";

type Self = { id: string; displayName: string };

function readSelf(): Self | null {
  try {
    const raw = localStorage.getItem(SELF_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Self;
    if (!parsed?.id || !parsed.displayName) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeSelf(row: Pick<ListingRow, "id" | "displayName">) {
  try {
    localStorage.setItem(SELF_KEY, JSON.stringify({ id: row.id, displayName: row.displayName }));
  } catch {
    /* preview iframes can block storage */
  }
}

type Props = {
  opponent: ListingRow;
  leaderDollars: number;
  listings?: ListingRow[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DuelLaunch({ opponent, leaderDollars, listings, open, onOpenChange }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<ListingRow[]>([]);
  const [needPay, setNeedPay] = useState(false);
  const [pickOther, setPickOther] = useState(false);
  const [remembered, setRemembered] = useState<ListingRow | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!open) return;
    setNeedPay(false);
    setPickOther(false);
    setQuery("");
    setHits([]);
    const saved = readSelf();
    if (!saved || saved.id === opponent.id) {
      setRemembered(null);
      return;
    }
    const local = listings?.find((row) => row.id === saved.id);
    if (local) {
      setRemembered(local);
      return;
    }
    void getListing({ data: { id: saved.id } }).then((row) => {
      if (row && row.id !== opponent.id) setRemembered(row);
      else setRemembered(null);
    });
  }, [open, opponent.id, listings]);

  useEffect(() => {
    if (!open || needPay) return;
    const q = query.trim();
    if (q.length < 1) {
      setHits([]);
      setSearching(false);
      return;
    }
    const controller = new AbortController();
    setSearching(true);
    const timer = window.setTimeout(async () => {
      try {
        const rows = await searchListings({ data: { q } });
        if (controller.signal.aborted) return;
        setHits(rows.filter((row) => row.id !== opponent.id).slice(0, 8));
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 180);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, open, needPay, opponent.id]);

  const showSearch = needPay ? false : !remembered || pickOther;

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-bg/70" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-xl bg-surface outline-none">
          <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-border-strong" />
          <div className="overflow-y-auto px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4">
            <p className="text-sm text-muted">
              {copy.duelMark} {copy.duel}
            </p>
            <Drawer.Title className="mt-1 font-display text-3xl leading-none text-fg">
              {copy.duelChallenge(opponent.displayName)}
            </Drawer.Title>
            <p className="mt-2 text-sm text-muted">{copy.duelYouHint}</p>

            <div className="mt-4 flex items-center gap-3 rounded-lg bg-bg p-3">
              <ListingLogo
                type={opponent.targetType}
                targetKey={opponent.targetKey}
                targetUrl={opponent.targetUrl}
                name={opponent.displayName}
                size="md"
              />
              <div className="min-w-0">
                <p className="text-xs text-subtle">{copy.duelThem}</p>
                <p className="truncate font-medium text-fg">{opponent.displayName}</p>
              </div>
            </div>

            {remembered && !needPay && !pickOther ? (
              <div className="mt-5 flex flex-col gap-2">
                <Button asChild size="xl" className="w-full">
                  <Link
                    to="/duel/$left/$right"
                    params={{ left: remembered.id, right: opponent.id }}
                    onClick={() => writeSelf(remembered)}
                  >
                    <span aria-hidden>{copy.duelMark}</span>
                    {copy.duelAs(remembered.displayName)}
                  </Link>
                </Button>
                <Button type="button" variant="ghost" onClick={() => setPickOther(true)}>
                  {copy.duelOther}
                </Button>
              </div>
            ) : null}

            {showSearch && !needPay ? (
              <div className="mt-5">
                <p className="text-sm font-medium text-fg">{copy.duelWho}</p>
                <Input
                  className="mt-2"
                  value={query}
                  placeholder={copy.duelFind}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  onChange={(event) => setQuery(event.target.value)}
                />
                {query.trim() ? (
                  <ul className="mt-3 flex flex-col gap-1">
                    {hits.map((row) => (
                      <li key={row.id}>
                        <Link
                          to="/duel/$left/$right"
                          params={{ left: row.id, right: opponent.id }}
                          onClick={() => writeSelf(row)}
                          className={cn(
                            "flex h-14 w-full items-center gap-3 rounded-md px-3 text-left",
                            "bg-elevated text-fg transition-colors duration-150 hover:bg-bg",
                          )}
                        >
                          <ListingLogo
                            type={row.targetType}
                            targetKey={row.targetKey}
                            targetUrl={row.targetUrl}
                            name={row.displayName}
                            size="md"
                          />
                          <span className="min-w-0 flex-1 truncate font-medium">{row.displayName}</span>
                          <span className="text-sm text-muted">{copy.duelMark}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {query.trim() && !searching && hits.length === 0 ? (
                  <p className="mt-3 text-sm text-muted">{copy.duelNoHits}</p>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3 w-full"
                  onClick={() => setNeedPay(true)}
                >
                  {copy.duelNew}
                </Button>
              </div>
            ) : null}

            {needPay ? (
              <div className="mt-5">
                <p className="mb-4 text-sm text-muted">{copy.duelMissing}</p>
                <BidForm
                  leaderDollars={leaderDollars}
                  defaultAmount={5}
                  duelOpponentId={opponent.id}
                  onPaid={async (listingId) => {
                    writeSelf({ id: listingId, displayName: query.trim() || "you" });
                    await router.navigate({
                      to: "/duel/$left/$right",
                      params: { left: listingId, right: opponent.id },
                    });
                  }}
                />
                <Button type="button" variant="ghost" className="mt-2 w-full" onClick={() => setNeedPay(false)}>
                  {copy.duelOther}
                </Button>
              </div>
            ) : null}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
