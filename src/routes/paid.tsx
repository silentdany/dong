import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { fulfillPaidSession } from "@/lib/board";

export const Route = createFileRoute("/paid")({
  validateSearch: z.object({
    session_id: z.string().optional(),
  }),
  loaderDeps: ({ search }) => ({ sessionId: search.session_id ?? "" }),
  loader: async ({ deps }) => {
    const sessionId = deps.sessionId.trim();
    if (!sessionId) throw redirect({ href: "/?paid=1" });
    const result = await fulfillPaidSession({ data: { sessionId } });
    throw redirect({ href: result.returnPath || "/?paid=1" });
  },
  component: function Paid() {
    return null;
  },
});
