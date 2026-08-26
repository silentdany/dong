import { ImageResponse } from 'next/og'
import { copy } from '@config/copy'
import { theme } from '@config/theme'

export const runtime = 'nodejs'

const WIDTH = 1200
const HEIGHT = 630
const PAD = 72
const TRACK = WIDTH - PAD * 2
const BAR_HEIGHT = 32
const HALO = 54

/** /og?cm=…&handle=…&ratio=… — the same card serves the site and any listing. */
export function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const cm = Math.max(0, Number(params.get('cm') ?? params.get('mm') ?? 0) || 0)
  const handle = params.get('handle') ?? params.get('name') ?? copy.domain
  const ratio = cm > 0 ? Math.min(1, Math.max(0, Number(params.get('ratio') ?? 1) || 1)) : 0
  const prefix = theme.meter.prefix
  const tip = theme.meter.tip

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
          padding: PAD,
        }}
      >
        <div style={{ display: 'flex', fontSize: 34, fontWeight: 700, letterSpacing: -1 }}>{copy.tagline}</div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, fontSize: 190, fontWeight: 700, letterSpacing: -8, lineHeight: 1, color: theme.colors.accent }}>
            {prefix ? <span style={{ fontSize: 120 }}>{prefix}</span> : null}
            <span>{copy.unitLabel(cm)}</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              width: TRACK,
              height: BAR_HEIGHT,
              marginTop: 40,
              marginLeft: HALO / 2,
              background: theme.colors.track,
              borderRadius: 999,
              position: 'relative',
            }}
          >
            <div
              style={{
                display: 'flex',
                position: 'absolute',
                left: -HALO / 2,
                top: (BAR_HEIGHT - HALO) / 2,
                width: HALO,
                height: HALO,
                borderRadius: 999,
                background: theme.colors.fill,
              }}
            />
            <div
              style={{
                display: 'flex',
                width: Math.max(theme.meter.minPx, TRACK * ratio),
                height: BAR_HEIGHT,
                background: theme.colors.fill,
                borderRadius: 999,
              }}
            />
            {tip && ratio > 0 ? (
              <div style={{ display: 'flex', marginLeft: 6, fontSize: 28, color: theme.colors.fill }}>
                {tip}
              </div>
            ) : null}
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 40, color: theme.colors.muted }}>{handle}</div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT },
  )
}
