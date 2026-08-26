import { copy } from '@config/copy'
import ListingRow from './ListingRow'
import type { BoardEntry } from '@/lib/board'

type Props = {
  entries: BoardEntry[]
  highlightId?: string
}

export default function Board({ entries, highlightId }: Props) {
  if (entries.length === 0) {
    return (
      <p className="py-10 text-center text-sm" style={{ color: 'var(--l-muted)' }}>
        {copy.ui.boardEmpty}
      </p>
    )
  }

  // Everything is measured against #1, so the top row always fills the track.
  const maxScoreCents = entries[0].scoreCents

  return (
    <ol className="flex flex-col gap-2">
      {entries.map((entry, index) => (
        <ListingRow
          key={entry.id}
          entry={entry}
          rank={index + 1}
          maxScoreCents={maxScoreCents}
          highlighted={entry.id === highlightId}
        />
      ))}
    </ol>
  )
}
