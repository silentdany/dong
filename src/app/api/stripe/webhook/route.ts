import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/db'
import { env } from '@/lib/env'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Rank is only ever finalised here, on Stripe's word. */
export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature')
  if (!signature) return NextResponse.json({ ok: false }, { status: 400 })

  // Read config before the try, so a missing secret surfaces as a 500 instead
  // of masquerading as a rejected signature.
  const secret = env.stripeWebhookSecret()
  const raw = await request.text()

  let event: Stripe.Event
  try {
    // Static verifier: signature checking needs the webhook secret, not an API key.
    event = Stripe.webhooks.constructEvent(raw, signature, secret)
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    await creditSession(event.data.object)
  }

  return NextResponse.json({ received: true })
}

async function creditSession(session: Stripe.Checkout.Session): Promise<void> {
  if (session.payment_status !== 'paid') return

  const listingId = session.metadata?.listingId
  const amountCents = session.amount_total
  if (!listingId || !amountCents || amountCents <= 0) return

  // stripeSessionId is unique, so a replayed webhook cannot pay twice.
  const already = await prisma.payment.findUnique({ where: { stripeSessionId: session.id } })
  if (already) return

  try {
    await prisma.$transaction([
      prisma.payment.create({ data: { listingId, amountCents, stripeSessionId: session.id } }),
      prisma.listing.update({ where: { id: listingId }, data: { allTimeCents: { increment: amountCents } } }),
    ])
  } catch (error) {
    if ((error as { code?: string }).code === 'P2002') return
    throw error
  }
}
