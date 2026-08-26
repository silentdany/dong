import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { BidForm } from "@/components/bid-form";
import { DuelLaunch } from "@/components/duel-launch";
import { LengthMeter } from "@/components/length-meter";
import { ListingLogo } from "@/components/listing-logo";
import { Button } from "@/components/ui/button";
import { getLeader, getListing, getBoard } from "@/lib/board";
import { badgeFor, copy } from "@/lib/copy";
import { currentCents } from "@/lib/decay";
import { ogAltListing, ogListing } from "@/lib/og/links";
import { useNow } from "@/lib/use-now";
import { costToTakeTop, lengthCm, toDollars } from "@/lib/ranking";
import { displayTarget } from "@/lib/target";
import { jsonLdScript, listingJsonLd, seoHead } from "@/lib/seo";

export const Route = createFileRoute("/l/$id")({
  loader: async ({ params }) => {
    const [listing, leader, entries] = await Promise.all([
      getListing({ data: { id: params.id } }),
      getLeader(),
      getBoard({ data: { window: "all" } }),
    ]);
    if (!listing) throw notFound();
    const rank = entries.findIndex((row) => row.id === listing.id) + 1;
    return { listing, leader, rank };
  },
  head: ({ loaderData }) => {
    const listing = loaderData?.listing;
    if (!listing) {
      return seoHead({
        title: copy.siteName,
        description: copy.homeMetaDescription,
        path: "/",
        index: false,
      });
    }
    const cm = lengthCm(listing.scoreCents);
    const leader = loaderData?.leader ?? 0;
    const rank = loaderData?.rank ?? 0;
    return {
      // Same shape the board uses: spread the head, then add the JSON-LD.
      ...seoHead({
        title: copy.listingMetaTitle(listing.displayName, cm),
        description: copy.listingMetaDescription(listing.displayName, listing.description),
        path: `/l/${listing.id}`,
        image: ogListing({
          name: listing.displayName,
          target: displayTarget(listing.targetType, listing.targetKey, listing.targetUrl),
          cm,
          rank,
          ratio: leader > 0 ? cm / leader : 1,
          badge: badgeFor(listing.scoreCents),
          desc: listing.description,
          takeTop: costToTakeTop(leader),
        }),
        imageAlt: ogAltListing(listing.displayName, cm),
      }),
      scripts: [
        jsonLdScript(
          listingJsonLd({
            id: listing.id,
            displayName: listing.displayName,
            description: listing.description,
            cm,
            rank,
            targetUrl: listing.targetUrl,
          }),
        ),
      ],
    };
  },
  component: ListingPage,
  notFoundComponent: () => (
    <AppShell>
      <p className="text-sm text-muted">{copy.missing}</p>
      <Link to="/" className="mt-4 inline-flex h-11 items-center text-sm text-fg underline">
        {copy.back}
      </Link>
    </AppShell>
  ),
});

function ListingPage() {
  const { listing, leader } = Route.useLoaderData();
  const now = useNow(1000);
  const [duelOpen, setDuelOpen] = useState(false);
  const snap = {
    levelAtLastPay: listing.levelAtLastPay,
    lastPaidAt: listing.lastPaidAt,
    peakCents: listing.peakCents,
  };
  const live = currentCents(snap, now);
  const target =
    listing.targetType === "handle"
      ? `@${listing.targetKey.replace(/^handle:/, "")}`
      : listing.targetUrl;

  return (
    <AppShell>
      <p className="text-xs text-muted">{badgeFor(live)}</p>
      <div className="mt-2 flex items-center gap-3">
        <ListingLogo
          type={listing.targetType}
          targetKey={listing.targetKey}
          targetUrl={listing.targetUrl}
          name={listing.displayName}
          size="lg"
        />
        <h1 className="min-w-0 font-display text-4xl leading-tight text-fg">
          {listing.displayName}
        </h1>
      </div>
      {listing.description ? (
        <p className="mt-2 text-sm text-muted">{listing.description}</p>
      ) : null}

      <div className="mt-6 rounded-lg bg-surface p-4">
        <LengthMeter
          snap={snap}
          now={now}
          maxCents={Math.max(listing.peakCents, live, 1)}
          featured
        />
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          <span className="tabular-nums">${toDollars(listing.allTimeCents)} paid</span>
          <a
            href={`/out/${listing.id}`}
            className="inline-block py-1 underline underline-offset-2"
            rel="nofollow"
          >
            {displayTarget(listing.targetType, listing.targetKey, listing.targetUrl)}
          </a>
        </div>
      </div>

      <Button type="button" variant="outline" className="mt-4" onClick={() => setDuelOpen(true)}>
        <span aria-hidden>{copy.duelMark}</span>
        {copy.duelChallenge(listing.displayName)}
      </Button>

      <section className="mt-8">
        <h2 className="font-display text-2xl text-fg">
          {copy.raiseMark} {copy.raise}
        </h2>
        <p className="mb-4 mt-1 text-sm text-muted">{copy.raiseHint}</p>
        <BidForm
          listingId={listing.id}
          lockedTarget={target}
          defaultName={listing.displayName}
          defaultDescription={listing.description}
          defaultAmount={toDollars(listing.allTimeCents) + 1}
          currentDollars={toDollars(listing.allTimeCents)}
          leaderDollars={leader}
        />
      </section>
      <DuelLaunch
        opponent={listing}
        leaderDollars={leader}
        open={duelOpen}
        onOpenChange={setDuelOpen}
      />
    </AppShell>
  );
}
