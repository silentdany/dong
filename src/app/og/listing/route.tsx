import { copy } from '@config/copy'
import { theme } from '@config/theme'
import { badgeFor } from '@config/theme'
import { alpha } from '@/lib/og/color'
import { SANS, SERIF } from '@/lib/og/fonts'
import { Frame, Lane, Ruler, TRACK, clamp } from '@/lib/og/parts'
import { card, n, s } from '@/lib/og/render'

export const runtime = 'nodejs'

/**
 * One listing.
 *
 *   /og/listing?name=levelsio&target=@levelsio&cm=428&rank=1&ratio=1&takeTop=433
 *
 * `ratio` is the listing's share of #1 (0..1), so the bar on the card is the
 * same bar the board draws. `badge` defaults to the theme badge for the total,
 * and `desc` is the listing's own one-liner.
 */
export function GET(request: Request) {
  const params = new URL(request.url).searchParams

  const cm = Math.max(0, Math.round(n(params, 'cm')))
  const rank = Math.max(0, Math.round(n(params, 'rank')))
  const share = Math.min(1, Math.max(0, n(params, 'ratio', 1)))
  const name = s(params, 'name', copy.siteName)
  const badge = s(params, 'badge', badgeFor(cm * 100))
  const takeTop = Math.max(0, Math.round(n(params, 'takeTop')))
  const desc = s(params, 'desc')

  return card(
    <Frame
      tag={copy.og.listingTag(rank)}
      footLeft={`${copy.og.paid(cm)} · ${clamp(badge, 24)}`}
      footRight={takeTop > 0 ? copy.og.takeTop(takeTop) : copy.og.unitRule}
    >
      <div
        style={{
          display: 'flex',
          width: TRACK,
          marginBottom: 30,
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 26,
          letterSpacing: 4,
          textTransform: 'uppercase',
          color: alpha(theme.colors.ink, 0.38),
        }}
      >
        {clamp(copy.tagline, 40)}
      </div>

      <Lane
        name={name}
        meta={s(params, 'target')}
        cm={cm}
        ratio={cm > 0 ? share : 0}
        tone={cm > 0 ? 'hot' : 'cold'}
        size="lg"
      />

      <div style={{ display: 'flex', width: TRACK, marginTop: 22 }}>
        <Ruler />
      </div>

      {desc ? (
        <div
          style={{
            display: 'flex',
            width: TRACK - 120,
            marginTop: 26,
            fontFamily: SERIF,
            fontSize: 34,
            lineHeight: 1.25,
            color: alpha(theme.colors.ink, 0.55),
          }}
        >
          {clamp(desc, 96)}
        </div>
      ) : null}
    </Frame>,
  )
}
