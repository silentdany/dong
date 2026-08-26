import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { baseUrl } from '@/lib/env'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const listing = await prisma.listing.findUnique({ where: { id }, select: { targetUrl: true, hidden: true } })

  if (!listing || listing.hidden) return NextResponse.redirect(baseUrl(), 302)

  await prisma.listing.update({ where: { id }, data: { clickCount: { increment: 1 } } })
  return NextResponse.redirect(listing.targetUrl, 302)
}
