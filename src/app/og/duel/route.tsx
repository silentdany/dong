import { copy } from '@config/copy'
import { theme } from '@config/theme'
import { alpha } from '@/lib/og/color'
import { SERIF } from '@/lib/og/fonts'
import { Frame, Lane, Ruler, TRACK, clamp, num } from '@/lib/og/parts'
import { card, n, ratio, s } from '@/lib/og/render'
import { TAKE_TOP_LEAD_CENTS, toDollars } from '@/lib/ranking'

export const runtime = 'nodejs'

/** Each half of the shared scale, either side of the vs medallion. */
const HALF = Math.round((TRACK - 56 - 44) / 2)

/**
 * Head-to-head card.
 *
 *   /og/duel?a=levelsio&acm=428&b=marc&bcm=96&ah=@levelsio&bh=@marc
 *
 * | param      | what                                                        |
 * | ---------- | ----------------------------------------------------------- |
 * | `a`, `b`   | display names. Longer one wins, order does not matter.      |
 * | `acm`,`bcm`| lengths in `copy.unitName`. `$1 = 1 cm`, so this is dollars. |
 * | `ah`,`bh`  | optional targets shown under each name (`@handle` / a URL).  |
 * | `flip`     | optional override for the price of taking the lead.          |
 * | `tag`      | optional label in the top-right chip.                        |
 *
 * Pure function of the query string: no database, so the engine can render a
 * duel that exists only as two numbers, and every distinct duel gets its own
 * cacheable URL.
 */
export function GET(request: Request) {
  const params = new URL(request.url).searchParams

  const sides = [
    { name: s(params, 'a', '—'), cm: Math.max(0, Math.round(n(params, 'acm'))), meta: s(params, 'ah') },
    { name: s(params, 'b', '—'), cm: Math.max(0, Math.round(n(params, 'bcm'))), meta: s(params, 'bh') },
  ]
  const tie = sides[0].cm === sides[1].cm
  const [top, low] = sides[0].cm >= sides[1].cm ? sides : [sides[1], sides[0]]

  const lead = top.cm - low.cm
  const times = low.cm > 0 ? top.cm / low.cm : 0
  const verdict = tie
    ? copy.duel.verdictTie
    : low.cm === 0
      ? copy.duel.verdictSolo(clamp(top.name, 24))
      : times >= 1.15
        ? copy.duel.verdict(clamp(top.name, 24), times >= 10 ? num(times) : times.toFixed(1))
        : copy.duel.verdictClose(clamp(top.name, 24), lead)

  // $1 = 1 cm, so a length is already a dollar total: passing the leader costs
  // their total plus the same lead the board charges for taking #1.
  const flipDefault = top.cm + toDollars(TAKE_TOP_LEAD_CENTS) - low.cm
  const flip = Math.max(0, Math.round(n(params, 'flip', flipDefault)))

  return card(
    <Frame
      tag={s(params, 'tag', copy.duel.tag)}
      footLeft={clamp(verdict, 50)}
      footRight={top.cm > 0 ? copy.duel.flip(flip) : copy.duel.flipNone}
      footStrong
    >
      <Lane
        name={top.name}
        meta={top.meta}
        cm={top.cm}
        ratio={1}
        tone={top.cm > 0 ? 'hot' : 'cold'}
        size="lg"
        chip={tie ? copy.duel.tieChip : copy.duel.winnerChip}
      />

      {/* The shared scale both bars are measured against, broken by the verdict. */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: TRACK,
          marginTop: 20,
          marginBottom: 20,
        }}
      >
        <Ruler width={HALF} count={25} />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 56,
            height: 56,
            marginTop: -8,
            borderRadius: 999,
            background: alpha(theme.colors.ink, 0.05),
            border: `1px solid ${alpha(theme.colors.ink, 0.16)}`,
            fontFamily: SERIF,
            fontSize: 30,
            color: alpha(theme.colors.ink, 0.66),
          }}
        >
          vs
        </div>
        <Ruler width={HALF} count={25} />
      </div>

      <Lane
        name={low.name}
        meta={low.meta}
        cm={low.cm}
        ratio={ratio(low.cm, top.cm)}
        tone={tie && low.cm > 0 ? 'hot' : 'cold'}
        size="sm"
        chip={tie ? copy.duel.tieChip : copy.duel.loserChip}
      />
    </Frame>,
  )
}
