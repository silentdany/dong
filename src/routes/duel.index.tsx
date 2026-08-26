import { Link, createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { copy } from "@/lib/copy";
import { ogAltText, ogText } from "@/lib/og/links";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/duel/")({
  head: () =>
    seoHead({
      title: copy.duelMetaTitle,
      description: copy.duelMetaDescription,
      path: "/duel",
      image: ogText({ tag: copy.duel, title: copy.duelIndexTitle, sub: copy.duelKicker }),
      imageAlt: ogAltText(copy.duel),
    }),
  component: DuelIndex,
});

function DuelIndex() {
  return (
    <AppShell>
      <p className="text-xs text-muted">
        {copy.duelMark} {copy.duel}
      </p>
      <h1 className="mt-2 font-display text-4xl leading-tight text-fg">{copy.duelIndexTitle}</h1>
      <p className="mt-3 max-w-prose text-sm text-muted">{copy.duelIndexHint}</p>
      <Link
        to="/"
        className="mt-6 inline-flex h-11 items-center text-sm font-medium text-accent underline underline-offset-2"
      >
        {copy.back}
      </Link>
    </AppShell>
  );
}
