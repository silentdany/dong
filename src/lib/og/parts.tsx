import type { ReactNode } from "react";
import { copy } from "@/lib/copy";
import { listingInitial } from "@/lib/logo";
import { alpha, mix } from "@/lib/og/color";
import { LOGO_PNG } from "@/lib/og/emoji";
import { SANS, SERIF } from "@/lib/og/fonts";
import { ogTheme } from "@/lib/og/theme";

export const CARD = { width: 1200, height: 630 } as const;
const PAD = 60;
export const TRACK = CARD.width - PAD * 2;

const c = ogTheme.colors;

export function clamp(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1)}…`;
}

export function fitPx(text: string, max: number, min: number, per: number): number {
  return Math.max(min, Math.min(max, Math.round(max - Math.max(0, text.length - per) * (max / per) * 0.55)));
}

export function num(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

export function usd(n: number): string {
  return `$${num(n)}`;
}

/** The board's logo, as the image people actually see on the site. */
export function Mark({ size = 34 }: { size?: number }) {
  return <img src={LOGO_PNG} width={size} height={size} alt="" style={{ display: "flex" }} />;
}

/** A round thumbnail of the target: the same face the board puts on a row. */
export function Avatar({ src, name, size }: { src?: string | null; name: string; size: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        width: size,
        height: size,
        borderRadius: 999,
        overflow: "hidden",
        background: c.elevated,
        border: `1px solid ${alpha(c.ink, 0.12)}`,
      }}
    >
      {src ? (
        <img src={src} width={size} height={size} alt="" style={{ width: size, height: size, objectFit: "cover" }} />
      ) : (
        <div
          style={{
            display: "flex",
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: Math.round(size * 0.42),
            color: c.muted,
          }}
        >
          {listingInitial(name)}
        </div>
      )}
    </div>
  );
}

/** lucide's ArrowRight, the icon <LengthMeter> puts at the tip of the fill. */
function Arrow({ size, color }: { size: number; color: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "flex" }}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

/** Crossed blades for the duel medallion — the ⚔️ the board uses, drawn. */
export function Blades({ size = 28, color = c.ink }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "flex" }}>
      <path
        d="M4 20 19 5M4.8 6.2 17.8 19.2"
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path d="M17.4 3.6 20.4 6.6" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M3.8 16.8h4.2v4" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * The board's meter, part for part: a full-width track, the peak left behind by
 * decay, the halo centred on the bar's own radius, and a solid fill with the
 * arrow inside its leading edge. No gradient and no glow — the site has neither,
 * and a card that invents them stops being the same object. Sizes follow
 * <LengthMeter>: the halo is 1.43x the bar, and the fill never shows less.
 */
export function Bar({
  trackWidth,
  share,
  peakShare = 0,
  barH,
  halo = true,
}: {
  trackWidth: number;
  share: number;
  peakShare?: number;
  barH: number;
  halo?: boolean;
}) {
  const haloSize = Math.round(barH * 1.43);
  const minFill = haloSize;
  const live = Math.min(1, Math.max(0, share));
  const peak = Math.min(1, Math.max(live, peakShare));
  const width = live <= 0 ? 0 : Math.max(minFill, Math.round(trackWidth * live));
  const peakWidth = peak <= 0 ? 0 : Math.max(minFill, Math.round(trackWidth * peak));

  return (
    <div style={{ display: "flex", position: "relative", alignItems: "center", width: trackWidth, height: barH }}>
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 0,
          left: 0,
          width: trackWidth,
          height: barH,
          borderRadius: 999,
          background: c.track,
        }}
      />

      {peakWidth > width ? (
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            left: 0,
            width: peakWidth,
            height: barH,
            borderRadius: 999,
            background: alpha(c.fill, 0.25),
          }}
        />
      ) : null}

      {halo && ogTheme.meter.baseHalo && width > 0 ? (
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: (barH - haloSize) / 2,
            left: barH / 2 - haloSize / 2,
            width: haloSize,
            height: haloSize,
            borderRadius: 999,
            background: alpha(c.fill, 0.15),
            border: `1px solid ${alpha(c.fill, 0.25)}`,
          }}
        />
      ) : null}

      {width > 0 ? (
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            left: 0,
            alignItems: "center",
            justifyContent: "flex-end",
            overflow: "hidden",
            width,
            height: barH,
            borderRadius: 999,
            // The board paints every meter the same `fill`; rank shows in the
            // size of the bar, never in its colour.
            background: c.fill,
          }}
        >
          <div style={{ display: "flex", marginRight: Math.max(3, Math.round(barH * 0.14)) }}>
            <Arrow size={Math.round(barH * 0.5)} color={c.bg} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function Chip({
  label,
  tone = "quiet",
  size = 20,
}: {
  label: string;
  tone?: "quiet" | "loud";
  size?: number;
}) {
  const loud = tone === "loud";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: size * 1.9,
        paddingLeft: size * 0.7,
        paddingRight: size * 0.7,
        borderRadius: 999,
        fontFamily: SANS,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: size * 0.14,
        textTransform: "uppercase",
        color: loud ? c.bg : alpha(c.ink, 0.66),
        background: loud ? c.fill : alpha(c.ink, 0.07),
        border: `1px solid ${loud ? "transparent" : alpha(c.ink, 0.14)}`,
      }}
    >
      {label}
    </div>
  );
}

export function Ruler({ width = TRACK, count = 61, tone = 0.22 }: { width?: number; count?: number; tone?: number }) {
  const ticks = [];
  for (let i = 0; i < count; i += 1) {
    const major = i % 10 === 0;
    const medium = !major && i % 5 === 0;
    ticks.push(
      <div
        key={i}
        style={{
          display: "flex",
          width: major ? 2 : 1,
          height: major ? 18 : medium ? 11 : 6,
          background: alpha(c.ink, major ? tone * 1.7 : tone),
        }}
      />,
    );
  }
  return (
    <div style={{ display: "flex", width, alignItems: "flex-start", justifyContent: "space-between", height: 18 }}>
      {ticks}
    </div>
  );
}

export function Lane({
  name,
  meta,
  cm,
  ratio,
  tone,
  size,
  chip,
  note,
  mark = false,
  avatar,
  peak,
  lost = 0,
}: {
  name: string;
  meta?: string;
  cm: number;
  ratio: number;
  tone: "hot" | "cold";
  size: "lg" | "md" | "sm";
  chip?: string;
  note?: string;
  mark?: boolean;
  /** Data URI from `logoData()`. Missing just means the initial shows instead. */
  avatar?: string | null;
  /** Peak share of the same scale, so decay reads as ground already lost. */
  peak?: number;
  lost?: number;
}) {
  const hot = tone === "hot";
  const barH = size === "lg" ? 28 : size === "md" ? 20 : 14;
  const nameMax = size === "lg" ? 48 : size === "md" ? 38 : 31;
  const figure = size === "lg" ? 96 : size === "md" ? 68 : 50;
  const face = size === "lg" ? 72 : size === "md" ? 56 : 44;
  const shown = clamp(name, size === "lg" ? 20 : 24);

  const inkTone = hot ? c.ink : alpha(c.ink, 0.75);
  const share = Math.min(1, Math.max(0, ratio));
  const peakShare = Math.min(1, Math.max(share, peak ?? 0));

  return (
    <div style={{ display: "flex", flexDirection: "column", width: TRACK }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", width: TRACK }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Avatar src={avatar} name={name} size={face} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {chip ? (
            <div style={{ display: "flex" }}>
              <Chip label={chip} tone={hot ? "loud" : "quiet"} size={size === "sm" ? 15 : 17} />
            </div>
          ) : null}
          <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
            <div
              style={{
                display: "flex",
                fontFamily: SANS,
                fontWeight: 700,
                fontSize: fitPx(shown, nameMax, Math.round(nameMax * 0.62), 14),
                letterSpacing: -1,
                lineHeight: 1,
                color: inkTone,
              }}
            >
              {shown}
            </div>
            {meta && size === "sm" ? (
              <div style={{ display: "flex", fontFamily: SANS, fontWeight: 600, fontSize: 20, color: alpha(c.ink, 0.3) }}>
                {clamp(meta, 30)}
              </div>
            ) : null}
          </div>
          {meta && size !== "sm" ? (
            <div
              style={{
                display: "flex",
                fontFamily: SANS,
                fontWeight: 600,
                fontSize: 21,
                color: alpha(c.ink, hot ? 0.45 : 0.3),
              }}
            >
              {clamp(meta, 38)}
            </div>
          ) : null}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {mark || size === "lg" ? <Mark size={Math.round(figure * 0.42)} /> : null}
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <div
              style={{
                display: "flex",
                fontFamily: SERIF,
                fontSize: figure,
                lineHeight: 0.86,
                letterSpacing: -2,
                color: hot ? c.accent : alpha(c.ink, 0.72),
              }}
            >
              {num(cm)}
            </div>
            <div
              style={{
                display: "flex",
                fontFamily: SANS,
                fontWeight: 700,
                fontSize: Math.round(figure * 0.24),
                letterSpacing: 1,
                color: hot ? alpha(c.ink, 0.6) : alpha(c.ink, 0.32),
              }}
            >
              {copy.unit}
            </div>
            {lost > 0 ? (
              <div
                style={{
                  display: "flex",
                  fontFamily: SANS,
                  fontWeight: 600,
                  fontSize: Math.round(figure * 0.2),
                  color: c.danger,
                }}
              >
                {`\u2212${num(lost)} ${copy.unit}`}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", width: TRACK, marginTop: size === "sm" ? 10 : 16 }}>
        <Bar trackWidth={TRACK} share={share} peakShare={peakShare} barH={barH} />
      </div>

      {note ? (
        <div
          style={{
            display: "flex",
            marginTop: 12,
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 21,
            letterSpacing: 0.2,
            color: alpha(c.ink, hot ? 0.55 : 0.34),
          }}
        >
          {note}
        </div>
      ) : null}
    </div>
  );
}

export function Frame({
  tag,
  footLeft,
  footRight,
  footStrong = false,
  children,
}: {
  tag?: string;
  footLeft?: string;
  footRight?: string;
  footStrong?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        position: "relative",
        width: CARD.width,
        height: CARD.height,
        padding: PAD,
        background: c.bg,
        color: c.ink,
        fontFamily: SANS,
      }}
    >
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 0,
          left: 0,
          width: CARD.width,
          height: CARD.height,
          backgroundImage: `radial-gradient(circle at 8% 88%, ${alpha(c.fill, 0.42)} 0%, ${alpha(c.fill, 0)} 55%)`,
        }}
      />
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 0,
          left: 0,
          width: CARD.width,
          height: CARD.height,
          backgroundImage: `radial-gradient(circle at 78% 8%, ${alpha(c.glans, 0.18)} 0%, ${alpha(c.fill, 0)} 45%)`,
        }}
      />
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 0,
          left: 0,
          width: CARD.width,
          height: 7,
          backgroundImage: `linear-gradient(90deg, ${c.fill} 0%, ${mix(c.glans, c.fill, 0.4)} 38%, ${alpha(c.fill, 0)} 100%)`,
        }}
      />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: TRACK }}>
        <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
          <Mark size={36} />
          <div style={{ display: "flex", fontFamily: SANS, fontWeight: 700, fontSize: 29, letterSpacing: -0.6 }}>
            {copy.siteName}
          </div>
        </div>
        {tag ? <Chip label={tag} /> : null}
      </div>

      <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", width: TRACK }}>
        {children}
      </div>

      {footLeft || footRight ? (
        <div style={{ display: "flex", flexDirection: "column", width: TRACK }}>
          <div style={{ display: "flex", width: TRACK, height: 1, background: alpha(c.ink, 0.12) }} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: TRACK,
              marginTop: 18,
              fontFamily: SANS,
              fontWeight: footStrong ? 700 : 600,
              fontSize: footStrong ? 31 : 23,
              letterSpacing: footStrong ? -0.6 : 0,
            }}
          >
            <div style={{ display: "flex", color: footStrong ? c.ink : alpha(c.ink, 0.5) }}>{footLeft ?? ""}</div>
            <div style={{ display: "flex", color: c.fill, fontSize: footStrong ? 26 : 23 }}>{footRight ?? ""}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Fills the row between the name block and the figure: TRACK less both, less gaps. */
const MINI_TRACK = TRACK - (52 + 34 + 266 + 168) - 20 * 4;

export function MiniRow({
  rank,
  name,
  cm,
  ratio: share,
  avatar,
}: {
  rank: number;
  name: string;
  cm: number;
  ratio: number;
  avatar?: string | null;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, width: TRACK, height: 46 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          width: 52,
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 23,
          color: alpha(c.ink, 0.3),
        }}
      >
        {`#${rank}`}
      </div>
      <Avatar src={avatar} name={name} size={34} />
      <div
        style={{
          display: "flex",
          width: 266,
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 27,
          letterSpacing: -0.4,
          color: alpha(c.ink, 0.72),
        }}
      >
        {clamp(name, 20)}
      </div>
      <Bar trackWidth={MINI_TRACK} share={share} barH={14} />
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "baseline",
          gap: 6,
          width: 168,
          fontFamily: SERIF,
          fontSize: 36,
          color: alpha(c.ink, 0.6),
        }}
      >
        {num(cm)}
        <div style={{ display: "flex", fontFamily: SANS, fontWeight: 700, fontSize: 17, color: alpha(c.ink, 0.32) }}>
          {copy.unit}
        </div>
      </div>
    </div>
  );
}
