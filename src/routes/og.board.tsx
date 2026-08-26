import { createFileRoute } from "@tanstack/react-router";
import { copy } from "@/lib/copy";
import { alpha } from "@/lib/og/color";
import { SANS } from "@/lib/og/fonts";
import { Frame, Lane, MiniRow, Ruler, TRACK, clamp } from "@/lib/og/parts";
import { card, n, ratio, s } from "@/lib/og/render";
import { ogTheme } from "@/lib/og/theme";

export const Route = createFileRoute("/og/board")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const params = new URL(request.url).searchParams;
        const kind = s(params, "kind") === "all-time" ? "all-time" : "today";
        const takeTop = Math.max(0, Math.round(n(params, "takeTop")));

        const rows = params
          .getAll("r")
          .map((raw) => {
            const [name = "", cm = "", target = ""] = raw.split("~");
            return { name: name.trim(), cm: Math.max(0, Math.round(Number(cm) || 0)), target: target.trim() };
          })
          .filter((row) => row.name.length > 0)
          .slice(0, 4);

        const leader = rows[0];
        const chasers = rows.slice(1);

        return card(
          <Frame
            tag={copy.og.boardTag(kind)}
            footLeft={copy.og.unitRule}
            footRight={takeTop > 0 ? copy.takeTop(takeTop) : copy.siteName}
          >
            {leader ? (
              <div style={{ display: "flex", flexDirection: "column", width: TRACK }}>
                <Lane
                  name={leader.name}
                  meta={leader.target || undefined}
                  cm={leader.cm}
                  ratio={1}
                  tone="hot"
                  size="lg"
                  chip="#1"
                />

                <div style={{ display: "flex", width: TRACK, marginTop: 20, marginBottom: chasers.length ? 14 : 0 }}>
                  <Ruler />
                </div>

                <div style={{ display: "flex", flexDirection: "column", width: TRACK }}>
                  {chasers.map((row, i) => (
                    <MiniRow
                      key={`${row.name}-${i}`}
                      rank={i + 2}
                      name={row.name}
                      cm={row.cm}
                      ratio={ratio(row.cm, leader.cm)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", width: TRACK }}>
                <div
                  style={{
                    display: "flex",
                    width: TRACK - 140,
                    fontFamily: SANS,
                    fontWeight: 700,
                    fontSize: 52,
                    lineHeight: 1.12,
                    letterSpacing: -1.4,
                    color: alpha(ogTheme.colors.ink, 0.82),
                  }}
                >
                  {clamp(copy.og.boardEmpty, 96)}
                </div>
                <div style={{ display: "flex", width: TRACK, marginTop: 40 }}>
                  <Ruler />
                </div>
              </div>
            )}
          </Frame>,
        );
      },
    },
  },
});
