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
          const result = await fulfillStripeSession(event.data.object);
          // A 200 tells Stripe the event is handled and it never sends it again.
          // Acknowledging a failed credit is how a charge goes through with no
          // centimetres behind it, so a retryable failure has to answer 5xx.
          if (!result.ok && result.retry) {
            return Response.json({ ok: false, retry: true }, { status: 500 });
          }
        }
        return Response.json({ received: true });
      },
    },
  },
});
