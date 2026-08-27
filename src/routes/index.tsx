import { createFileRoute, redirect } from "@tanstack/react-router";
import { BoardPage } from "@/components/board-page";
import { getBoard, getLeader } from "@/lib/board";
import { copy } from "@/lib/copy";
import { ogAltBoard, ogBoard, ogSideFromListing } from "@/lib/og/links";
import { costToTakeTop, lengthCm } from "@/lib/ranking";
import { paidSearch } from "@/lib/search";
import { boardJsonLd, jsonLdScript, seoHead } from "@/lib/seo";

const searchSchema = paidSearch.extend({
  board: paidSearch.shape.paid.innerType
    ? undefined
    : undefined,
});

export const Route = createFileRoute("/")({
  validateSearch: paidSearch.extend({
    board: (await import("zod")).z.enum(["today", "all"]).optional(),
  } as never),
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
  head: ({ loaderData }) => {
    const entries = loaderData?.entries ?? [];
    const leader = loaderData?.leader ?? 0;
    const top = entries[0];
    return {
      ...seoHead({
        title: copy.homeMetaTitle,
        description: copy.homeMetaDescription,
        path: "/",
        image: ogBoard({
          kind: "all-time",
          takeTop: costToTakeTop(leader),
          rows: entries.slice(0, 4).map(ogSideFromListing),
        }),
        imageAlt: top ? ogAltBoard(top.displayName, lengthCm(top.scoreCents)) : copy.homeMetaTitle,
      }),
      scripts: [jsonLdScript(boardJsonLd("all", entries))],
    };
  },
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
