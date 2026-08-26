import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
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

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const url = await trackClick({ data: { id } });
      if (!cancelled && url) window.location.replace(url);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <AppShell>
      <p className="text-sm text-muted">Leaving the board…</p>
    </AppShell>
  );
}
