import { createFileRoute } from "@tanstack/react-router";
import { copy } from "@/lib/copy";
import { alpha, mix } from "@/lib/og/color";
import { SANS, SERIF } from "@/lib/og/fonts";
import { Frame, Ruler, TRACK, clamp } from "@/lib/og/parts";
import { card, s } from "@/lib/og/render";
import { ogTheme } from "@/lib/og/theme";

const c = ogTheme.colors;

export const Route = createFileRoute("/og/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const params = url.searchParams;
        const legacyCm = params.get("cm") ?? params.get("mm");
        if (legacyCm !== null) {
          const next = new URL("/og/listing", url);
          next.searchParams.set("cm", legacyCm);
          next.searchParams.set("name", s(params, "handle", s(params, "name", copy.siteName)));
          next.searchParams.set("ratio", s(params, "ratio", "1"));
          return Response.redirect(next, 307);
        }

        return card(
          <Frame tag={copy.og.siteTag} footLeft={clamp(copy.footer, 72)} footRight={copy.siteName}>
            <div
              style={{
                display: "flex",
                width: TRACK,
                fontFamily: SERIF,
                fontSize: 118,
                lineHeight: 0.94,
                letterSpacing: -4,
                color: c.accent,
              }}
            >
              {clamp(copy.tagline, 30)}
            </div>

            <div
              style={{
                display: "flex",
                width: TRACK - 200,
                marginTop: 22,
                fontFamily: SANS,
                fontWeight: 600,
                fontSize: 31,
                lineHeight: 1.3,
                color: alpha(c.ink, 0.6),
              }}
            >
              {clamp(copy.kicker, 96)}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 26, width: TRACK, marginTop: 54 }}>
              <div style={{ display: "flex", fontFamily: SERIF, fontSize: 64, lineHeight: 1, color: c.ink }}>
                $1
              </div>

              <div
                style={{
                  display: "flex",
                  position: "relative",
                  alignItems: "center",
                  flex: 1,
                  height: 26,
                  paddingLeft: 22,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    position: "absolute",
                    left: 0,
                    top: -11,
                    width: 48,
                    height: 48,
                    borderRadius: 999,
                    background: alpha(c.fill, 0.4),
                    boxShadow: `0 0 0 6px ${alpha(c.fill, 0.16)}, 0 0 24px ${alpha(c.fill, 0.45)}`,
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    height: 26,
                    borderRadius: 999,
                    backgroundImage: `linear-gradient(90deg, ${mix(c.fill, c.ink, 0.3)} 0%, ${c.fill} 60%, ${mix(c.glans, c.fill, 0.5)} 100%)`,
                    boxShadow: `0 0 34px ${alpha(c.fill, 0.5)}`,
                  }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <div style={{ display: "flex", fontFamily: SERIF, fontSize: 64, lineHeight: 1, color: c.accent }}>
                  1
                </div>
                <div style={{ display: "flex", fontFamily: SANS, fontWeight: 700, fontSize: 26, color: alpha(c.ink, 0.6) }}>
                  {copy.unit}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", width: TRACK, marginTop: 26 }}>
              <Ruler />
            </div>
          </Frame>,
        );
      },
    },
  },
});
