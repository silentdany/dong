import type { Metadata } from 'next'
import { copy } from '@config/copy'

export const metadata: Metadata = { title: copy.ui.navAbout }

export default function AboutPage() {
  return (
    <article>
      <h1 className="text-2xl font-bold tracking-tight">{copy.ui.navAbout}</h1>
      <p className="mt-4 text-sm leading-relaxed">{copy.about}</p>
    </article>
  )
}
