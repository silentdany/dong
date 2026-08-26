import { useState } from "react";
import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { z } from "zod";
import { Copy } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { BidForm } from "@/components/bid-form";
import { LengthMeter } from "@/components/length-meter";
import { ListingLogo } from "@/components/listing-logo";
import { ShareOnX } from "@/components/share-on-x";
import { Button } from "@/components/ui/button";
import { getLeader, getListing } from "@/lib/board";
import type { ListingRow } from "@/lib/board";
import { copy } from "@/lib/copy";
import { currentCents } from "@/lib/decay";
import { lengthCm, toDollars } from "@/lib/ranking";
import { displayTarget } from "@/lib/target";
import { useNow } from "@/lib/use-now";
import { cn } from "@/lib/utils";
import { seoHead } from "@/lib/seo";
import { ogAltDuel, ogDuel, ogSideFromListing } from "@/lib/og/links";

export const Route = createFileRoute("/duel/$left/$right")({
  validateSearch: z.object({
    paid: z.string().optional(),
    l: z.string().optional(),
  }),
  loader: async ({ params }) => {
    if (params.left === params.right) throw notFound();
    const [left, right, leader] = await Promise.all([
      getListing({ data: { id: params.left } }),
      getListing({ data: { id: params.right } }),
      getLeader(),
    ]);
    if (!left || !right) throw notFound();
    return { left, right, leader };
  },
  head: ({ loaderData }) => {
    const left = loaderData?.left;
    const right = loaderData?.right;
    if (!left || !right) {
      return seoHead({
        title: copy.duelMetaTitle,
        description: copy.duelMetaDescription,
        path: "/duel",
        index: false,
      });
    }
    return seoHead({
      title: copy.duelPairTitle(left.displayName, right.displayName),
      description: copy.duelPairDescription(left.displayName, right.displayName),
      path: `/duel/${left.id}/${right.id}`,
      image: ogDuel({ a: ogSideFromListing(left), b: ogSideFromListing(right) }),
      imageAlt: ogAltDuel(left.displayName, right.displayName),
    });
  },
  component: DuelPage,
  notFoundComponent: () => (
    <AppShell>
      <p className="text-sm text-muted">{copy.missing}</p>
      <Link to="/" className="mt-4 inline-flex h-11 items-center text-sm text-fg underline">
        {copy.back}
      </Link>
    </AppShell>
  ),
});

function snapOf(row: ListingRow) {
  return {
    levelAtLastPay: row.levelAtLastPay,
    lastPaidAt: row.lastPaidAt,
    peakCents: row.peakCents,
  };
}

function targetOf(row: ListingRow) {
  return row.targetType === "handle" ? `@${row.targetKey.replace(/^handle:/, "")}` : row.targetUrl;
}

function DuelSide({
  row,
  now,
  maxCents,
  winning,
  tied,
  leaderDollars,
  justPaid,
  onPaid,
}: {
  row: ListingRow;
  now: number;
  maxCents: number;
  winning: boolean;
  tied: boolean;
  leaderDollars: number;
  justPaid: boolean;
  onPaid: (listingId: string) => void | Promise<void>;
}) {
  const live = currentCents(snapOf(row), now);
  const big = winning && !tied;
  return (
    <section
      className={cn(
        "rounded-lg",
        big && "bg-elevated p-5 ring-1 ring-fill/50",
        !big && "bg-surface p-4",
        !winning && !tied && "opacity-80",
        justPaid && "ring-2 ring-fill",
      )}
    >
      <div className="flex items-center gap-3">
        <ListingLogo
          type={row.targetType}
          targetKey={row.targetKey}
          targetUrl={row.targetUrl}
          name={row.displayName}
          size={big ? "lg" : "md"}
        />
        <div className="min-w-0">
          {big ? (
            <p className="text-xs font-medium uppercase tracking-wide text-fill-text">
              {copy.duelHolding}
            </p>
          ) : null}
          <h2
            className={cn(
              "truncate leading-tight text-fg",
              big ? "font-display text-4xl" : "text-lg font-medium",
            )}
          >
            {row.displayName}
          </h2>
          <p className="truncate text-xs text-muted">
            {/* A duel is a shop window too. Plain text here meant a duel could
                send its audience nowhere and earn its sides no clicks. */}
            <a
              href={`/out/${row.id}`}
              rel="nofollow noopener sponsored"
              className="underline-offset-2 hover:underline"
            >
              {displayTarget(row.targetType, row.targetKey, row.targetUrl)}
            </a>
          </p>
        </div>
      </div>
      <div className="mt-4">
        <LengthMeter
          snap={snapOf(row)}
          now={now}
          maxCents={maxCents}
          rank={big ? 1 : tied ? 2 : 3}
          featured={big}
        />
      </div>
      <p className="mt-3 text-xs text-muted">${toDollars(row.allTimeCents)} paid</p>
      <div className="mt-5">
        <h3 className="font-medium text-fg">
          {winning || tied ? `${copy.raiseMark} ${copy.raise}` : copy.duelCatchUp}
        </h3>
        <div className="mt-3">
          <BidForm
            key={row.id}
            listingId={row.id}
            lockedTarget={targetOf(row)}
            defaultName={row.displayName}
            defaultDescription={row.description}
            defaultAmount={toDollars(row.allTimeCents) + 1}
            currentDollars={toDollars(row.allTimeCents)}
            leaderDollars={leaderDollars}
            cmOnly
            onPaid={onPaid}
          />
        </div>
      </div>
    </section>
  );
}

function DuelPage() {
  const { left, right, leader } = Route.useLoaderData();
  const { paid, l: paidListingId } = Route.useSearch();
  const router = useRouter();
  const now = useNow(1000);
  const [copied, setCopied] = useState(false);
  const leftLive = currentCents(snapOf(left), now);
  const rightLive = currentCents(snapOf(right), now);
  const maxCents = Math.max(left.peakCents, right.peakCents, leftLive, rightLive, 1);
  const delta = Math.abs(lengthCm(leftLive) - lengthCm(rightLive));
  const tied = leftLive === rightLive;
  const leftWins = leftLive > rightLive;
  const winner = leftWins ? left : right;
  const loser = leftWins ? right : left;

  async function afterPaid(listingId: string) {
    await router.navigate({
      to: "/duel/$left/$right",
      params: { left: left.id, right: right.id },
      search: { paid: "1", l: listingId },
      replace: true,
    });
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <AppShell>
      <p className="text-xs text-muted">
        {copy.duelMark} {copy.duel}
      </p>
      <h1 className="mt-2 font-display text-3xl leading-[1.05] text-fg sm:text-4xl">
        {left.displayName} <span className="text-muted">{copy.duelVs}</span> {right.displayName}
      </h1>
      <p className="mt-2 text-sm text-muted">{copy.duelKicker}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" className="h-11" onClick={() => void copyLink()}>
          <Copy className="size-4" />
          {copied ? copy.duelCopied : copy.duelCopy}
        </Button>
        <ShareOnX
          text={copy.shareDuel(left.displayName, right.displayName)}
          path={`/duel/${left.id}/${right.id}`}
        />
      </div>

      {!tied ? (
        <div className="mt-8 rounded-lg bg-elevated px-4 py-6 text-center ring-1 ring-fill/40">
          <p className="text-sm text-muted">{winner.displayName}</p>
          <p className="mt-1 font-display text-7xl leading-none tracking-tight text-fill-text sm:text-8xl">
            {copy.duelGap(delta)}
          </p>
          <p className="mt-2 font-display text-2xl text-fg">{copy.duelLonger}</p>
        </div>
      ) : (
        <p className="mt-8 text-center font-display text-3xl text-fg">{copy.duelTied}</p>
      )}

      {paid === "1" ? (
        <p className="mt-4 rounded-md bg-surface px-3 py-3 text-sm text-muted">
          {paidListingId === left.id
            ? copy.confirmWho(left.displayName)
            : paidListingId === right.id
              ? copy.confirmWho(right.displayName)
              : copy.justPaid}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col gap-4">
        <DuelSide
          key={tied ? left.id : winner.id}
          row={tied ? left : winner}
          now={now}
          maxCents={maxCents}
          winning={!tied}
          tied={tied}
          leaderDollars={leader}
          justPaid={paidListingId === (tied ? left.id : winner.id)}
          onPaid={afterPaid}
        />
        <p className="text-center font-display text-2xl text-subtle">{copy.duelVs}</p>
        <DuelSide
          key={tied ? right.id : loser.id}
          row={tied ? right : loser}
          now={now}
          maxCents={maxCents}
          winning={false}
          tied={tied}
          leaderDollars={leader}
          justPaid={paidListingId === (tied ? right.id : loser.id)}
          onPaid={afterPaid}
        />
      </div>
    </AppShell>
  );
}
