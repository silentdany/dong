import type { Metadata } from 'next'
import { copy } from '@config/copy'
import { textCardMetadata } from '@/lib/og/links'

export const metadata: Metadata = textCardMetadata({
  tag: copy.ui.navAbout,
  title: copy.aboutTitle,
  sub: copy.aboutGrafs[copy.aboutGrafs.length - 1],
  description: copy.about,
})

export default function AboutPage() {
  return (
    <article>
      <h1 className="font-display text-4xl leading-tight">{copy.aboutTitle}</h1>
      <div className="mt-6 flex max-w-prose flex-col gap-4">
        {copy.aboutGrafs.map((graf) => (
          <p key={graf} className="text-base leading-relaxed">
            {graf}
          </p>
        ))}
      </div>
    </article>
  )
}
