import { ImageResponse } from 'next/og'
import { copy } from '@config/copy'
import { theme } from '@config/theme'

export const runtime = 'nodejs'

const WIDTH = 1200
const HEIGHT = 630
const TRACK_WIDTH = 1000

/** /og?name=…&cm=…&rank=… — the same card serves the site and any listing. */
export function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const name = params.get('name') ?? copy.siteName
  const cm = Number(params.get('cm') ?? 0)
  const rank = Number(params.get('rank') ?? 0)
  const ratio = cm > 0 ? Math.min(1, Math.max(0.06, cm / Math.max(cm, 200))) : 0.06

  return new ImageResponse(
    (
      <div
        style={{
          width: WIDTH,
          height: HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: theme.colors.bg,
          color: theme.colors.ink,
          padding: 72,
        }}
      >
        <div style={{ display: 'flex', fontSize: 32, letterSpacing: -1, color: theme.colors.muted }}>
          {copy.siteName}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', fontSize: 64, fontWeight: 700, letterSpacing: -2 }}>{name}</div>

          <div style={{ display: 'flex', alignItems: 'center', width: TRACK_WIDTH, height: 28, background: theme.colors.track, borderRadius: 999 }}>
            <div style={{ display: 'flex', width: TRACK_WIDTH * ratio, height: 28, background: theme.colors.fill, borderRadius: 999 }} />
            <div style={{ display: 'flex', marginLeft: 8, fontSize: 24, color: theme.colors.fill }}>{theme.meter.cap}</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 24 }}>
            <div style={{ display: 'flex', fontSize: 72, fontWeight: 700, color: theme.colors.accent }}>
              {copy.unitLabel(cm)}
            </div>
            {rank > 0 ? (
              <div style={{ display: 'flex', fontSize: 36, color: theme.colors.muted }}>{`${copy.ui.rank} #${rank}`}</div>
            ) : null}
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 28, color: theme.colors.muted }}>{copy.ogDescription}</div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT },
  )
}
