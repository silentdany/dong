import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { BoardPage } from "@/components/board-page";
import { getBoard, getLeader } from "@/lib/board";
import { copy } from "@/lib/copy";
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
  head: ({ loaderData }) => ({
    ...seoHead({
      title: copy.todayMetaTitle,
      description: copy.todayMetaDescription,
      path: "/today",
    }),
    scripts: [jsonLdScript(boardJsonLd("today", loaderData?.entries ?? []))],
  }),
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
