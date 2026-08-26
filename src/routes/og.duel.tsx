import { createFileRoute } from "@tanstack/react-router";
import { copy } from "@/lib/copy";
import { logoDataAll } from "@/lib/og/avatar";
import { alpha } from "@/lib/og/color";
import { SERIF } from "@/lib/og/fonts";
import { Blades, Frame, Lane, Ruler, TRACK, clamp, num } from "@/lib/og/parts";
import { card, n, ratio, s } from "@/lib/og/render";
import { ogTheme } from "@/lib/og/theme";
import { TOP_GAP } from "@/lib/ranking";

const HALF = Math.round((TRACK - 56 - 44) / 2);

export const Route = createFileRoute("/og/duel")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const params = new URL(request.url).searchParams;
        const sides = [
          { name: s(params, "a", "—"), cm: Math.max(0, Math.round(n(params, "acm"))), meta: s(params, "ah") },
          { name: s(params, "b", "—"), cm: Math.max(0, Math.round(n(params, "bcm"))), meta: s(params, "bh") },
        ];
        const tie = sides[0].cm === sides[1].cm;
        const [top, low] = sides[0].cm >= sides[1].cm ? sides : [sides[1], sides[0]];
        const [topFace, lowFace] = await logoDataAll([top.meta, low.meta]);

        const lead = top.cm - low.cm;
        const times = low.cm > 0 ? top.cm / low.cm : 0;
        const verdict = tie
          ? copy.og.verdictTie
          : low.cm === 0
            ? copy.og.verdictSolo(clamp(top.name, 24))
            : times >= 1.15
              ? copy.og.verdict(clamp(top.name, 24), times >= 10 ? num(times) : times.toFixed(1))
              : copy.og.verdictClose(clamp(top.name, 24), lead);

        const flipDefault = top.cm + TOP_GAP - low.cm;
        const flip = Math.max(0, Math.round(n(params, "flip", flipDefault)));

        return card(
          <Frame
            tag={s(params, "tag", copy.og.duelTag)}
            footLeft={clamp(verdict, 64)}
            footRight={top.cm > 0 ? copy.og.flip(flip) : copy.og.flipNone}
            footStrong
          >
            <Lane
              name={top.name}
              meta={top.meta}
              avatar={topFace}
              cm={top.cm}
              ratio={1}
              tone={top.cm > 0 ? "hot" : "cold"}
              size="lg"
              chip={tie ? copy.og.tieChip : copy.og.winnerChip}
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: TRACK,
                marginTop: 20,
                marginBottom: 20,
              }}
            >
              <Ruler width={HALF} count={25} />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 56,
                  height: 56,
                  marginTop: -8,
                  borderRadius: 999,
                  background: alpha(ogTheme.colors.ink, 0.05),
                  border: `1px solid ${alpha(ogTheme.colors.ink, 0.16)}`,
                  fontFamily: SERIF,
                  fontSize: 30,
                  color: alpha(ogTheme.colors.ink, 0.66),
                }}
              >
                <Blades size={26} color={alpha(ogTheme.colors.ink, 0.7)} />
              </div>
              <Ruler width={HALF} count={25} />
            </div>

            <Lane
              name={low.name}
              meta={low.meta}
              avatar={lowFace}
              cm={low.cm}
              ratio={ratio(low.cm, top.cm)}
              tone={tie && low.cm > 0 ? "hot" : "cold"}
              size="sm"
              chip={tie ? copy.og.tieChip : copy.og.loserChip}
            />
          </Frame>,
        );
      },
    },
  },
});
