import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/d/$left/$right")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/duel/$left/$right",
      params,
    });
  },
});
