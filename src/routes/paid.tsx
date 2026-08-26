import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { fulfillPaidSession } from "@/lib/board";
import { copy } from "@/lib/copy";

export const Route = createFileRoute("/paid")({
  validateSearch: z.object({
    session_id: z.string().optional(),
  }),
  loaderDeps: ({ search }) => ({ sessionId: search.session_id ?? "" }),
  loader: async ({ deps }) => {
    const result = await fulfillPaidSession({ data: { sessionId: deps.sessionId } });
    throw redirect({ href: result.href || "/?paid=1" });
  },
  component: function Paid() {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <p className="font-display text-2xl text-fg">{copy.justPaid}</p>
      </main>
    );
  },
});
