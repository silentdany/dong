import { NextResponse } from 'next/server'
import { priceBid, reserveListing } from '@/lib/bid'
import { bidSchema } from '@/lib/validation'
import { stripe } from '@/lib/stripe'
import { baseUrl } from '@/lib/env'
import { copy } from '@config/copy'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const parsed = bidSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ ok: false, code: 'invalid-input' }, { status: 400 })

  const result = await priceBid(parsed.data)
  if (!result.ok) return NextResponse.json(result, { status: 400 })

  const { bid } = result
  const listingId = await reserveListing(bid, parsed.data)
  const site = baseUrl()

  const session = await stripe().checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          // Price comes from the server-side diff, never from the client.
          unit_amount: bid.chargeCents,
          product_data: {
            name: `${copy.siteName} — ${bid.target.label}`,
            description: copy.unitLabel(Math.floor(bid.newTotalCents / 100)),
          },
        },
      },
    ],
    metadata: { listingId, chargeCents: String(bid.chargeCents) },
    success_url: `${site}/success?l=${listingId}`,
    cancel_url: `${site}/cancel`,
  })

  if (!session.url) return NextResponse.json({ ok: false, code: 'stripe-error' }, { status: 502 })
  return NextResponse.json({ ok: true, url: session.url })
}
