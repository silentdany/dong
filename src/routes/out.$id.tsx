import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { trackClick } from "@/lib/board";
import { copy } from "@/lib/copy";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/out/$id")({
  head: () =>
    seoHead({
      title: copy.siteName,
      description: copy.homeMetaDescription,
      path: "/",
      index: false,
    }),
  component: Outbound,
});

function Outbound() {
  const { id } = Route.useParams();

  const [gone, setGone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const url = await trackClick({ data: { id } });
      if (cancelled) return;
      if (url) {
        window.location.replace(url);
        return;
      }
      // No target means the listing is hidden or no longer exists — a link
      // shared before a reset, say. Send them back instead of leaving them on
      // "Leaving the board…" for ever.
      setGone(true);
      window.location.replace("/");
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <AppShell>
      <p className="text-sm text-muted">{gone ? copy.leavingGone : copy.leaving}</p>
      {/* The redirect is JavaScript. This is the way out when it does not run. */}
      <p className="mt-3 text-sm">
        <Link to="/" className="text-accent underline underline-offset-2">
          {copy.backToBoard}
        </Link>
      </p>
    </AppShell>
  );
}
