import { copy } from '@config/copy'
import { theme } from '@config/theme'
import { alpha } from '@/lib/og/color'
import { SANS } from '@/lib/og/fonts'
import { Frame, Lane, MiniRow, Ruler, TRACK, clamp } from '@/lib/og/parts'
import { card, n, ratio, s } from '@/lib/og/render'

export const runtime = 'nodejs'

/**
 * The board, as it stands right now.
 *
 *   /og/board?kind=today&r=levelsio~428~@levelsio&r=marc~96&r=pieter~40&takeTop=433
 *
 * Rows are `name~cm~target`, repeated and already in rank order. The whole
 * board state lives in the URL, which is what makes the card cache correctly:
 * a new leader is a new URL, so timelines never keep showing yesterday's #1.
 */
export function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const kind = s(params, 'kind') === 'all-time' ? 'all-time' : 'today'
  const takeTop = Math.max(0, Math.round(n(params, 'takeTop')))

  const rows = params
    .getAll('r')
    .map((raw) => {
      const [name = '', cm = '', target = ''] = raw.split('~')
      return { name: name.trim(), cm: Math.max(0, Math.round(Number(cm) || 0)), target: target.trim() }
    })
    .filter((row) => row.name.length > 0)
    .slice(0, 4)

  const leader = rows[0]
  const chasers = rows.slice(1)

  return card(
    <Frame
      tag={copy.og.boardTag(kind)}
      footLeft={copy.og.unitRule}
      footRight={takeTop > 0 ? copy.og.takeTop(takeTop) : copy.domain}
    >
      {leader ? (
        // A real element, not a fragment: Satori lays out children, not shards.
        <div style={{ display: 'flex', flexDirection: 'column', width: TRACK }}>
          <Lane
            name={leader.name}
            meta={leader.target || undefined}
            cm={leader.cm}
            ratio={1}
            tone="hot"
            size="lg"
            chip="#1"
          />

          <div style={{ display: 'flex', width: TRACK, marginTop: 20, marginBottom: chasers.length ? 14 : 0 }}>
            <Ruler />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', width: TRACK }}>
            {chasers.map((row, i) => (
              <MiniRow key={`${row.name}-${i}`} rank={i + 2} name={row.name} cm={row.cm} ratio={ratio(row.cm, leader.cm)} />
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', width: TRACK }}>
          <div
            style={{
              display: 'flex',
              width: TRACK - 140,
              fontFamily: SANS,
              fontWeight: 700,
              fontSize: 52,
              lineHeight: 1.12,
              letterSpacing: -1.4,
              color: alpha(theme.colors.ink, 0.82),
            }}
          >
            {clamp(copy.og.boardEmpty, 96)}
          </div>
          <div style={{ display: 'flex', width: TRACK, marginTop: 40 }}>
            <Ruler />
          </div>
        </div>
      )}
    </Frame>,
  )
}
