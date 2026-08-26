import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { env } from '@/lib/env'
import { hideSchema } from '@/lib/validation'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const parsed = hideSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 })

  const adminKey = env.adminKey()
  if (!adminKey || parsed.data.key !== adminKey) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  await prisma.listing.update({
    where: { id: parsed.data.id },
    data: { hidden: parsed.data.hidden },
  })
  return NextResponse.json({ ok: true, hidden: parsed.data.hidden })
}
