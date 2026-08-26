import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { BoardPage } from "@/components/board-page";
import { getBoard, getLeader } from "@/lib/board";
import { copy } from "@/lib/copy";
import { boardJsonLd, jsonLdScript, seoHead } from "@/lib/seo";

const searchSchema = z.object({
  paid: z.string().optional(),
  l: z.string().optional(),
  board: z.enum(["today", "all"]).optional(),
});

export const Route = createFileRoute("/")({
  validateSearch: searchSchema,
  beforeLoad: ({ search }) => {
    if (search.board === "today") {
      throw redirect({
        to: "/today",
        search: {
          ...(search.paid ? { paid: search.paid } : {}),
          ...(search.l ? { l: search.l } : {}),
        },
      });
    }
    if (search.board === "all") {
      throw redirect({
        to: "/",
        search: {
          ...(search.paid ? { paid: search.paid } : {}),
          ...(search.l ? { l: search.l } : {}),
        },
      });
    }
  },
  loader: async () => {
    const [entries, leader] = await Promise.all([
      getBoard({ data: { window: "all" } }),
      getLeader(),
    ]);
    return { entries, leader };
  },
  head: ({ loaderData }) => ({
    ...seoHead({
      title: copy.homeMetaTitle,
      description: copy.homeMetaDescription,
      path: "/",
    }),
    scripts: [jsonLdScript(boardJsonLd("all", loaderData?.entries ?? []))],
  }),
  component: Home,
});

function Home() {
  const { entries, leader } = Route.useLoaderData();
  const { paid, l } = Route.useSearch();
  return (
    <BoardPage
      windowName="all"
      entries={entries}
      leader={leader}
      paid={paid}
      highlightId={l}
    />
  );
}
