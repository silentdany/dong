import type { Metadata } from 'next'
import { copy } from '@config/copy'

export const metadata: Metadata = { title: copy.aboutTitle }

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
