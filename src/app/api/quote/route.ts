import { NextResponse } from 'next/server'
import { priceBid } from '@/lib/bid'
import { bidSchema } from '@/lib/validation'
import { lengthCm } from '@/lib/ranking'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Price preview so the form can show the charge before anyone is redirected. */
export async function POST(request: Request) {
  const parsed = bidSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ ok: false, code: 'invalid-input' }, { status: 400 })

  const result = await priceBid(parsed.data)
  if (!result.ok) return NextResponse.json(result, { status: 400 })

  const { bid } = result
  return NextResponse.json({
    ok: true,
    chargeDollars: bid.chargeCents / 100,
    currentDollars: bid.currentTotalCents / 100,
    minDollars: bid.minTotalCents / 100,
    takeTopDollars: bid.costToTakeTopCents / 100,
    projectedRank: bid.projectedRank,
    lengthCm: lengthCm(bid.newTotalCents),
    label: bid.target.label,
  })
}
