import type { ReactNode } from "react";
import { copy } from "@/lib/copy";
import { alpha, mix } from "@/lib/og/color";
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

/** Vector eggplant — Satori has no emoji font. Same mark the board uses. */
export function Mark({ size = 34 }: { size?: number }) {
  const leaf = mix(c.fill, "#79c257", 0.88);
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ display: "flex" }}>
      <defs>
        <linearGradient id="markBody" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor={mix(c.fill, c.ink, 0.38)} />
          <stop offset="52%" stopColor={c.fill} />
          <stop offset="100%" stopColor={mix(c.glans, c.fill, 0.35)} />
        </linearGradient>
      </defs>
      <ellipse cx="28" cy="37" rx="14" ry="26" transform="rotate(35 28 37)" fill="url(#markBody)" />
      <path
        d="M17.5 36C19 29.5 22.5 23.5 27.5 20"
        fill="none"
        stroke={alpha(c.ink, 0.3)}
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path d="M47 12.5 54 5" fill="none" stroke={mix(leaf, c.bg, 0.25)} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M42 18c-4.5-1-7-4.5-7-9 4.5 1 7.5 4 8.5 8z" fill={leaf} />
      <path d="M43.5 16.5c-1.5-4.5 0-9 3.5-11.5 2 4 1.5 8.5-1 11z" fill={mix(leaf, c.ink, 0.2)} />
      <path d="M45.5 18.5c3.5-2.5 8-3 11.5-1.5-3 3.5-7 4.5-10.5 3z" fill={mix(leaf, c.bg, 0.12)} />
    </svg>
  );
}

function Tip({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" style={{ display: "flex" }}>
      <path d="M2 1.2 10 6l-8 4.8z" fill={color} />
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
}) {
  const hot = tone === "hot";
  const barH = size === "lg" ? 28 : size === "md" ? 20 : 13;
  const nameMax = size === "lg" ? 48 : size === "md" ? 38 : 31;
  const figure = size === "lg" ? 96 : size === "md" ? 68 : 50;
  const halo = Math.round(barH * 1.85);
  const shown = clamp(name, size === "lg" ? 22 : 26);

  const fill = hot
    ? `linear-gradient(90deg, ${mix(c.fill, c.bg, 0.22)} 0%, ${c.fill} 48%, ${mix(c.glans, c.fill, 0.4)} 100%)`
    : mix(c.track, c.ink, 0.16);
  const inkTone = hot ? c.ink : alpha(c.ink, 0.52);
  const share = Math.min(1, Math.max(0, ratio));
  const width = share <= 0 ? 0 : Math.max(ogTheme.meter.minPx, Math.round((TRACK - halo / 2) * share));

  return (
    <div style={{ display: "flex", flexDirection: "column", width: TRACK }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", width: TRACK }}>
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
                color: hot ? c.accent : alpha(c.ink, 0.45),
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
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          width: TRACK,
          marginTop: size === "sm" ? 10 : 16,
          paddingLeft: halo / 2,
        }}
      >
        <div
          style={{
            display: "flex",
            position: "relative",
            alignItems: "center",
            width: TRACK - halo / 2,
            height: barH,
            background: c.track,
            borderRadius: 999,
          }}
        >
          {ogTheme.meter.baseHalo ? (
            <div
              style={{
                display: "flex",
                position: "absolute",
                left: -halo / 2,
                top: (barH - halo) / 2,
                width: halo,
                height: halo,
                borderRadius: 999,
                background: hot ? alpha(c.fill, 0.35) : mix(c.track, c.ink, 0.16),
                boxShadow: hot ? `0 0 0 4px ${alpha(c.fill, 0.16)}, 0 0 18px ${alpha(c.fill, 0.35)}` : "none",
              }}
            />
          ) : null}
          <div
            style={{
              display: "flex",
              width,
              height: barH,
              borderRadius: 999,
              background: fill,
              boxShadow: hot ? `0 0 34px ${alpha(c.fill, 0.55)}` : "none",
            }}
          />
          <div style={{ display: "flex", marginLeft: 9, opacity: hot ? 1 : 0.45 }}>
            <Tip size={Math.round(barH * 0.72)} color={hot ? c.fill : mix(c.track, c.ink, 0.3)} />
          </div>
        </div>
      </div>

      {note ? (
        <div
          style={{
            display: "flex",
            marginTop: 12,
            marginLeft: halo / 2,
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

export function MiniRow({ rank, name, cm, ratio: share }: { rank: number; name: string; cm: number; ratio: number }) {
  const width = Math.max(6, Math.round(Math.min(1, Math.max(0, share)) * 100));
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
      <div
        style={{
          display: "flex",
          width: 300,
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 27,
          letterSpacing: -0.4,
          color: alpha(c.ink, 0.72),
        }}
      >
        {clamp(name, 20)}
      </div>
      <div style={{ display: "flex", flex: 1, height: 8, borderRadius: 999, background: alpha(c.ink, 0.07) }}>
        <div
          style={{ display: "flex", width: `${width}%`, height: 8, borderRadius: 999, background: mix(c.track, c.ink, 0.22) }}
        />
      </div>
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
