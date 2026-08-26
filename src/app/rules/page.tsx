import type { Metadata } from 'next'
import { copy } from '@config/copy'

export const metadata: Metadata = { title: copy.rulesTitle }

export default function RulesPage() {
  return (
    <article>
      <h1 className="font-display text-4xl leading-tight">{copy.rulesTitle}</h1>
      <p className="mt-2 text-sm font-medium">{copy.rulesKicker}</p>
      <ol className="mt-6 flex max-w-prose list-decimal flex-col gap-3 pl-5 text-sm leading-relaxed">
        {copy.rules.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ol>
    </article>
  )
}
