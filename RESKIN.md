# Reskinning

Two files. Nothing else. Ranking, Stripe, normalization and the database are
untouched by a reskin.

## `config/copy.ts`

| Key | Notes |
| --- | --- |
| `siteName`, `domain` | Brand. Appears in the header, OG card and Stripe line item. |
| `tagline`, `description` | Homepage headline and the one sentence under it. |
| `ctaPrimary`, `ctaRaise` | Button labels. |
| `unitName`, `unitLabel(n)` | The unit. `unitLabel` formats it: `(84) => '84 cm'`. |
| `boardToday`, `boardAllTime` | Toggle labels. |
| `claimNumberOne(dollars)` | The live cost-to-#1 line. |
| `newListingHint(dollars)` | Hint under the form. |
| `rulesTitle`, `rules[]` | `/rules`. Plain strings, any length of list. |
| `about` | `/about`. |
| `footer` | Footer line. |
| `ogTitle`, `ogDescription` | Share card text. |
| `og.*` | Share card chrome: the unit rule, the chips, the alt text. |
| `duel.*` | The head-to-head card: chips, verdict lines, the flip price. |
| `successTitle`, `cancelTitle` | Stripe return pages. |
| `ui.*` | Row chrome: empty state, click counter, rank word, redirect copy. |
| `form.*` | Field labels, placeholders, quote sentences. |
| `errors.*` | Every rejection message the user can hit. |

`unitLabel`, `claimNumberOne`, `newListingHint`, `ui.clicks`, `ui.total`,
`form.quote*` and `errors.*` are **functions** — they receive numbers already
converted to display units (cm, whole dollars, rank). Keep the signatures.

## `config/theme.ts`

| Key | Notes |
| --- | --- |
| `colors.bg / ink / muted / card` | Page, text, secondary text, row surface. |
| `colors.accent / accentInk` | Primary button and links; `accentInk` is text on accent. |
| `colors.track / fill` | Meter track and meter fill. |
| `colors.danger` | Error text. |
| `radius` | One value, used everywhere. |
| `font` | A CSS font stack string. |
| `meter.prefix` | Shown left of the length figure on the page. `''` disables it. |
| `meter.tip` | Mark on the leading edge of the fill on the page. |
| `meter.baseHalo` | Soft circular base at the start of the bar, on the page and on the cards. |
| `meter.minPx` | Smallest visible fill, so a minimum bid is still a mark. |
| `meter.maxPx` | Track width cap in px. `0` means no cap: the track fills the row. |
| `meter.heightPx` / `meter.topHeightPx` | Bar height, and the taller one for the top ranks. |
| `meter.topRanks` | How many ranks get the tall bar and the big number. |
| `meter.valuePx` / `meter.topValuePx` | Font size of the length figure, and the big one for the top ranks. |
| `meter.growMs` | Fill animation duration. Bars mount at zero and grow. |
| `badges[]` | `{ minCents, label }`, ascending. Highest threshold reached wins. |

Colours, `radius` and `font` reach CSS as `--l-<token>` via `themeCssVars()`. If
you add a colour token it becomes a variable automatically; use it as
`var(--l-yourToken)`. The `meter` numbers are read straight from `theme.ts` by
`RankMeter`, so there is one source of truth and no matching CSS to update.

## Example: a louder comedy skin

Labels only — the meter stays an abstract bar.

```ts
// config/copy.ts
siteName: 'girth.lol',
domain: 'girth.lol',
tagline: 'Money is the only personality trait we can verify.',
description: 'Pay up, get long, sit on top until someone with a better card shows up.',
ctaPrimary: 'Inflate me',
ctaRaise: 'More',
unitName: 'units',
unitLabel: (n: number) => `${n.toLocaleString('en-US')} units of respect`,
boardToday: 'Right now',
boardAllTime: 'Since forever',
claimNumberOne: (d: number) => `dethroning #1: $${d.toLocaleString('en-US')}, cash only, no feelings`,
successTitle: 'Transaction complete. You are objectively larger.',
cancelTitle: 'You blinked. Nothing happened.',
ui: { boardEmpty: 'an empty board. tragic. #1 costs $5', /* … */ },
```

```ts
// config/theme.ts
colors: {
  bg: '#0d0b10', ink: '#f4f0ff', muted: '#8a82a3',
  accent: '#ff2e88', accentInk: '#0d0b10',
  track: '#241f2e', fill: '#ff2e88',
  danger: '#ff5c5c', card: '#161320',
},
radius: '2px',
font: "'Courier New', ui-monospace, monospace",
meter: { cap: '›', minPx: 18, maxPx: 0, heightPx: 10, topHeightPx: 28, topRanks: 1, valuePx: 14, topValuePx: 40, growMs: 300 },
badges: [
  { minCents: 0, label: 'nobody' },
  { minCents: 500, label: 'trying' },
  { minCents: 2000, label: 'invested' },
  { minCents: 10000, label: 'unwell' },
],
```

Set `html { color-scheme: dark }` in `src/app/globals.css` when the palette goes
dark — that one line is the only file outside `config/` a reskin ever touches.

## What a reskin must not touch

`src/lib/ranking.ts` (the $5 / $1 / +$5 rules), `src/lib/normalize.ts` (target
keys), `src/lib/bid.ts` (pricing) and `src/app/api/**` (Stripe). Changing the
unit name does not change the money: `$1` always credits `100` cents, and
`lengthCm()` always floors cents to whole dollars.

## Share cards

`src/app/og/**` reads the same two files. Every surface, glow and hairline on a
card is derived from `theme.colors` by `src/lib/og/color.ts`, so changing `fill`
changes every bar and every glow on every card, and `unitName` changes the unit
printed next to each figure. There is no second palette to keep in sync.

Two things a card cannot take from the theme:

- **Emoji.** Satori embeds fonts and has no emoji font, so `meter.prefix` and
  `copy.logo` never reach a card -- the brand mark is drawn as vectors in
  `src/lib/og/parts.tsx`. Reskinning the mark means editing that SVG.
- **Font files.** The page loads its faces from Google Fonts; a card loads the
  `.ttf` files in `src/app/og/fonts`. Changing `theme.font` changes the page
  only. To change the cards, drop new `.ttf` files in that folder and point
  `src/lib/og/fonts.ts` at them.
