import type { Metadata } from 'next'
import Link from 'next/link'
import { copy } from '@config/copy'

export const metadata: Metadata = { title: copy.cancelTitle }

export default function CancelPage() {
  return (
    <section>
      <h1 className="text-2xl font-bold tracking-tight">{copy.cancelTitle}</h1>
      <p className="mt-2 text-sm" style={{ color: 'var(--l-muted)' }}>
        {copy.ui.cancelBody}
      </p>
      <Link href="/" className="mt-4 inline-block text-sm underline underline-offset-2" style={{ color: 'var(--l-accent)' }}>
        {copy.ui.backToBoard}
      </Link>
    </section>
  )
}
