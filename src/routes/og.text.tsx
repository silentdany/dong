import { createFileRoute } from "@tanstack/react-router";
import { copy } from "@/lib/copy";
import { alpha } from "@/lib/og/color";
import { SANS, SERIF } from "@/lib/og/fonts";
import { Frame, Ruler, TRACK, clamp, fitPx } from "@/lib/og/parts";
import { card, s } from "@/lib/og/render";
import { ogTheme } from "@/lib/og/theme";

export const Route = createFileRoute("/og/text")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const params = new URL(request.url).searchParams;
        const title = s(params, "title", copy.tagline);
        const sub = s(params, "sub", copy.kicker);

        return card(
          <Frame tag={s(params, "tag")} footLeft={clamp(copy.footer, 72)} footRight={copy.og.unitRule}>
            <div
              style={{
                display: "flex",
                width: TRACK,
                fontFamily: SERIF,
                fontSize: fitPx(title, 106, 58, 22),
                lineHeight: 1,
                letterSpacing: -3,
                color: ogTheme.colors.accent,
              }}
            >
              {clamp(title, 64)}
            </div>

            <div
              style={{
                display: "flex",
                width: TRACK - 180,
                marginTop: 26,
                fontFamily: SANS,
                fontWeight: 600,
                fontSize: 30,
                lineHeight: 1.35,
                color: alpha(ogTheme.colors.ink, 0.6),
              }}
            >
              {clamp(sub, 132)}
            </div>

            <div style={{ display: "flex", width: TRACK, marginTop: 44 }}>
              <Ruler />
            </div>
          </Frame>,
        );
      },
    },
  },
});
