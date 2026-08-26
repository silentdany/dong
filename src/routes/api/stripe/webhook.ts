import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const signature = request.headers.get("stripe-signature");
        if (!signature) return Response.json({ ok: false }, { status: 400 });
        const raw = await request.text();
        const { constructStripeEvent, fulfillStripeSession } = await import("@/lib/pay");
        const event = constructStripeEvent(raw, signature);
        if (!event) return Response.json({ ok: false }, { status: 400 });
        if (event.type === "checkout.session.completed") {
          await fulfillStripeSession(event.data.object);
        }
        return Response.json({ received: true });
      },
    },
  },
});
