import type { Metadata } from 'next'
import { copy } from '@config/copy'
import { textCardMetadata } from '@/lib/og/links'
import PaidRedirect from './PaidRedirect'

export const metadata: Metadata = textCardMetadata({
  tag: copy.og.paidTag,
  title: copy.successTitle,
  sub: copy.ui.successBody,
})

type SearchParams = Promise<{ l?: string }>

export default async function SuccessPage({ searchParams }: { searchParams: SearchParams }) {
  const { l } = await searchParams
  const next = l ? `/?paid=1&l=${encodeURIComponent(l)}` : '/?paid=1'

  return (
    <section>
      <h1 className="text-2xl font-bold tracking-tight">{copy.successTitle}</h1>
      <p className="mt-2 text-sm" style={{ color: 'var(--l-muted)' }}>
        {copy.ui.successBody}
      </p>
      <PaidRedirect href={next} label={copy.ui.backToBoard} />
    </section>
  )
}
