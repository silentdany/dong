# dong

A satirical pay-to-rank public leaderboard. A listing is a public URL or an X
handle. Rank is total money paid, shown as a length in centimetres: **$1 = 1 cm**.
It is an advertising auction with a status board attached.

Working skin: `length.lol`. The brand, domain, units, labels, colours and the
rank meter are 100% skinnable from `config/copy.ts` and `config/theme.ts` —
see [RESKIN.md](./RESKIN.md).

## Stack

Next.js App Router · TypeScript · Tailwind CSS v4 · Prisma + SQLite · Stripe
Checkout. No auth, no accounts, no AI. Deploys on Vercel.

## Run it

```bash
npm i
cp .env.example .env         # fill in your Stripe test keys
npx prisma migrate dev       # creates prisma/dev.db
stripe listen --forward-to localhost:3000/api/stripe/webhook
npm run dev
```

`stripe listen` prints a `whsec_…` secret — put it in `STRIPE_WEBHOOK_SECRET`
and restart `npm run dev`. Rank is only ever written by the webhook, so nothing
appears on the board until Stripe confirms the payment.

## How ranking works

- New listing minimum: **$5**. Whole dollars only.
- The amount in the form is your **lifetime total**. An existing listing is
  charged only the difference, and must clear its current total by at least $1.
- Passing #1 costs at least **$5 more** than their total. Anything between their
  total and that threshold is rejected; pay their total or less and you simply
  land at the rank that buys.
- Equal totals: the **older** listing keeps the higher rank.
- Same URL or same normalized `@handle` = the same listing.
- Two boards: **today** (payments in the last 24h) and **all-time** (lifetime).
  Today is the default view.
- Payments are final.

Targets are normalized before they are keyed: handles lowercase without `@`,
URLs parsed with `URL()` with tracking params stripped. App Store / Play /
GitHub style links are keyed by path, so marketing params never split a listing
in two. Invite links (Telegram, WhatsApp, Discord, Signal) and obvious porn
domains are refused.

## Share cards

Every page ships its own 1200x630 card, rendered by `next/og`. A card is a pure
function of its query string -- no database read -- which makes the URL the
cache key: when the board moves, the image URL changes and scrapers re-fetch
instead of serving last week's leader forever.

Build the URLs with the helpers in `src/lib/og/links.ts` rather than by hand:

```ts
import { duelMetadata, ogBoard, ogDuel, ogImage, ogListing, textCardMetadata } from '@/lib/og/links'
```

| Page | Card |
| --- | --- |
| `/` | `/og/board` -- #1 with a full bar, the next three as compact rows |
| `/l/[id]` | `/og/listing` -- name, length, rank, badge, cost to take #1 |
| `/rules`, `/about`, `/success`, `/cancel` | `/og/text` |
| anything else | `/og` |

### Duels

The duel card is ready before the duel pages are. It takes two names and two
lengths, sorts them itself, and works out the verdict and the price of flipping
the result from the board's own rules:

```
/og/duel?a=levelsio&acm=428&ah=@levelsio&b=Marc%20Lou&bcm=96&bh=@marc_louvion
```

A duel page wires its whole card in one call:

```ts
export async function generateMetadata({ params }): Promise<Metadata> {
  const duel = await getDuel((await params).id)
  return duelMetadata({
    a: { name: duel.a.displayName, cm: lengthCm(duel.a.allTimeCents), target: targetLabel(duel.a) },
    b: { name: duel.b.displayName, cm: lengthCm(duel.b.allTimeCents), target: targetLabel(duel.b) },
  })
}
```

Ties, a side that has never paid, and names long enough to break a layout are
all handled by the card. `flip` and `tag` override the computed price and the
top-right label when a duel has its own rules.

### Fonts

Satori embeds fonts, it does not fall back to the system, and it has no emoji
font. The three faces in `src/app/og/fonts` ship in the repo and are pinned in
`next.config.ts` output tracing, so a card never touches the network. The
brand mark is drawn as vectors for the same reason -- `theme.meter.prefix` is a
page-only flourish and never reaches a card.

## Deploy

Set `DATABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_BASE_URL` and `ADMIN_KEY` in
Vercel. For Postgres, switch the `datasource` provider in
`prisma/schema.prisma` to `postgresql` and point `DATABASE_URL` at it — nothing
else changes. Add the deployed `/api/stripe/webhook` URL as a Stripe webhook
endpoint listening to `checkout.session.completed`.

## Admin

The only admin surface is hiding a listing:

```bash
curl -X POST "$BASE/api/admin/hide" \
  -H 'content-type: application/json' \
  -d '{"key":"'"$ADMIN_KEY"'","id":"<listingId>","hidden":true}'
```

## Routes

| Route | What |
| --- | --- |
| `/` | Board + bid form. `?board=all-time`, `?paid=1&l=<id>` |
| `/l/[id]` | Listing detail + raise form |
| `/rules`, `/about` | Copy from `config/copy.ts` |
| `/success`, `/cancel` | Stripe return pages |
| `/out/[id]` | Counts the click, 302s to the target |
| `/og` | Default share card. Legacy `?cm=&handle=` forwards to `/og/listing` |
| `/og/board` | The board as it stands. `?kind=&r=name~cm~target&takeTop=` |
| `/og/duel` | Head to head. `?a=&acm=&ah=&b=&bcm=&bh=&flip=&tag=` |
| `/og/listing` | One listing. `?name=&target=&cm=&rank=&ratio=&badge=&desc=&takeTop=` |
| `/og/text` | Typographic card. `?tag=&title=&sub=` |
| `/api/quote` | Server-computed price preview |
| `/api/checkout` | Reserves the listing, creates the Stripe session |
| `/api/stripe/webhook` | Finalises rank, idempotent on `stripeSessionId` |
| `/api/admin/hide` | `ADMIN_KEY`-gated hide |
