import { createFileRoute } from "@tanstack/react-router";
import { badgeFor, copy } from "@/lib/copy";
import { logoData } from "@/lib/og/avatar";
import { alpha } from "@/lib/og/color";
import { SANS, SERIF } from "@/lib/og/fonts";
import { Frame, Lane, Ruler, TRACK, clamp } from "@/lib/og/parts";
import { card, n, s } from "@/lib/og/render";
import { ogTheme } from "@/lib/og/theme";

export const Route = createFileRoute("/og/listing")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const params = new URL(request.url).searchParams;
        const cm = Math.max(0, Math.round(n(params, "cm")));
        const rank = Math.max(0, Math.round(n(params, "rank")));
        const share = Math.min(1, Math.max(0, n(params, "ratio", 1)));
        const name = s(params, "name", copy.siteName);
        const badge = s(params, "badge", badgeFor(cm * 100));
        const takeTop = Math.max(0, Math.round(n(params, "takeTop")));
        const desc = s(params, "desc");
        const target = s(params, "target");
        const avatar = await logoData(target);

        return card(
          <Frame
            tag={copy.og.listingTag(rank)}
            footLeft={`${copy.og.paid(cm)} · ${clamp(badge, 24)}`}
            footRight={takeTop > 0 ? copy.takeTop(takeTop) : copy.og.unitRule}
          >
            <div
              style={{
                display: "flex",
                width: TRACK,
                marginBottom: 30,
                fontFamily: SANS,
                fontWeight: 700,
                fontSize: 26,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: alpha(ogTheme.colors.ink, 0.38),
              }}
            >
              {clamp(copy.tagline, 40)}
            </div>

            <Lane
              name={name}
              meta={target}
              avatar={avatar}
              cm={cm}
              ratio={cm > 0 ? share : 0}
              peak={Math.min(1, Math.max(0, n(params, "peak", 0)))}
              lost={Math.max(0, Math.round(n(params, "lost")))}
              tone={cm > 0 ? "hot" : "cold"}
              size="lg"
            />

            <div style={{ display: "flex", width: TRACK, marginTop: 22 }}>
              <Ruler />
            </div>

            {desc ? (
              <div
                style={{
                  display: "flex",
                  width: TRACK - 120,
                  marginTop: 26,
                  fontFamily: SERIF,
                  fontSize: 34,
                  lineHeight: 1.25,
                  color: alpha(ogTheme.colors.ink, 0.55),
                }}
              >
                {clamp(desc, 96)}
              </div>
            ) : null}
          </Frame>,
        );
      },
    },
  },
});
