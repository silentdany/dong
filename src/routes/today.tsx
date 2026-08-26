import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { BoardPage } from "@/components/board-page";
import { getBoard, getLeader } from "@/lib/board";
import { copy } from "@/lib/copy";
import { ogAltBoard, ogBoard, ogSideFromListing } from "@/lib/og/links";
import { costToTakeTop, lengthCm } from "@/lib/ranking";
import { boardJsonLd, jsonLdScript, seoHead } from "@/lib/seo";

const searchSchema = z.object({
  paid: z.string().optional(),
  l: z.string().optional(),
});

export const Route = createFileRoute("/today")({
  validateSearch: searchSchema,
  loader: async () => {
    const [entries, leader] = await Promise.all([
      getBoard({ data: { window: "today" } }),
      getLeader(),
    ]);
    return { entries, leader };
  },
  head: ({ loaderData }) => {
    const entries = loaderData?.entries ?? [];
    const leader = loaderData?.leader ?? 0;
    const top = entries[0];
    return {
      ...seoHead({
        title: copy.todayMetaTitle,
        description: copy.todayMetaDescription,
        path: "/today",
        image: ogBoard({
          kind: "today",
          takeTop: costToTakeTop(leader),
          rows: entries.slice(0, 4).map(ogSideFromListing),
        }),
        imageAlt: top ? ogAltBoard(top.displayName, lengthCm(top.scoreCents)) : copy.todayMetaTitle,
      }),
      scripts: [jsonLdScript(boardJsonLd("today", entries))],
    };
  },
  component: TodayPage,
});

function TodayPage() {
  const { entries, leader } = Route.useLoaderData();
  const { paid, l } = Route.useSearch();
  return (
    <BoardPage
      windowName="today"
      entries={entries}
      leader={leader}
      paid={paid}
      highlightId={l}
    />
  );
}
