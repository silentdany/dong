import type { Metadata } from 'next'
import { copy } from '@config/copy'

export const metadata: Metadata = { title: copy.rulesTitle }

export default function RulesPage() {
  return (
    <article>
      <h1 className="text-2xl font-bold tracking-tight">{copy.rulesTitle}</h1>
      <ul className="mt-4 flex list-disc flex-col gap-2 pl-5 text-sm">
        {copy.rules.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
    </article>
  )
}
