const usd = (dollars: number) => `$${dollars.toLocaleString("en-US")}`;

export const copy = {
  siteName: "epenis.lol",
  logo: "🍆",
  tagline: "Stop pretending.",
  kicker: "You already paid to be taller. We named the unit.",
  description:
    "You screenshot the rank. You post the ROI. You call it pipeline. It was always a ruler. $1 buys 1 cm. It falls 1 cm per hour. You cannot fake a charge.",
  unit: "cm",
  unitLabel: (n: number) => `${n.toLocaleString("en-US")} cm`,
  unitHint: "cm, paid",
  today: "Today",
  allTime: "All-time",
  homeMetaTitle: "epenis.lol — stop pretending",
  homeMetaDescription:
    "A public ruler. $1 buys 1 cm. Rank is current length. It falls 1 cm an hour. You cannot fake a charge.",
  todayTitle: "Still up today.",
  todayKicker: "24 hours. Then gravity.",
  todayDescription:
    "Who paid recently enough to still have something up. Same ruler. Same centimetres. The rest already went soft.",
  todayEmpty:
    "Nobody paid in the last 24 hours. The board went soft. $5 and you're today's only honest one.",
  todayMetaTitle: "Today — epenis.lol",
  todayMetaDescription:
    "Who is still up on epenis.lol in the last 24 hours. $1 = 1 cm. Gravity is 1 cm an hour. Pay or go soft.",
  rulesMetaDescription:
    "How epenis.lol works. $1 = 1 cm. It falls 1 cm an hour. No refunds. No costume.",
  aboutMetaDescription: "Why epenis.lol exists. Rank was always money. We named the centimetres.",
  duelMetaTitle: "Duel — epenis.lol",
  duelMetaDescription:
    "Pick someone on the board. Send the link. If they care, they pay. If they don't, they stay shorter in public.",
  listingMetaTitle: (name: string, cm: number) => `${name} — ${cm} cm — epenis.lol`,
  listingMetaDescription: (name: string, line: string) =>
    line
      ? `${name} on epenis.lol. ${line.replace(/[.!?]$/, "")}. $1 = 1 cm. It falls 1 cm an hour.`
      : `${name} on the public ruler. $1 = 1 cm. Rank is paid length. It falls 1 cm an hour.`,
  duelPairTitle: (a: string, b: string) => `${a} vs ${b} — epenis.lol`,
  duelPairDescription: (a: string, b: string) =>
    `${a} vs ${b} on epenis.lol. A public duel. $1 = 1 cm. The shorter one pays or stays shorter.`,
  buy: "Pay for real",
  raise: "Add cm",
  raiseMark: "📏",
  takeTop: (dollars: number) => `${usd(dollars)} to stop pretending you're #1`,
  leaderLine: (cm: number) =>
    cm > 0
      ? `#1 is holding ${cm} cm and it is already going soft.`
      : "Nobody has paid. The sock is still on.",
  drawerHint:
    "$5 to exist. $1 = 1 cm. Then it droops 1 cm an hour. Whole dollars. No costume discount.",
  raiseHint:
    "Handle and name stay put. You pay the difference. The one line is fair game — that's the troll.",
  empty: "Empty board. Five dollars and you're the only honest one. That's the whole joke.",
  rulesNav: "Rules",
  aboutNav: "About",
  rulesTitle: "The rules",
  rulesKicker: "No costume. No screenshots. Pay.",
  aboutTitle: "About",
  noRefunds: "Final. No refunds. Pretending is free. This is not.",
  demoPay:
    "This preview does not charge a card. Confirm and the centimetres land on this name anyway.",
  cardNext: "Card next. Centimetres land on this name when Stripe confirms — never the other guy.",
  confirmPay: "Pay for real",
  confirmTitle: (cm: number, name?: string) =>
    name ? `${name} at ${cm} cm. That's the receipt.` : `Drop the act at ${cm} cm?`,
  confirmWho: (name: string) => `Paying for ${name}. Not the other guy.`,
  cancel: "Keep pretending",
  submitting: "Dropping the act…",
  justPaid: "Paid. That's the only screenshot that counts.",
  /** The live counters under the board. */
  stats: {
    online: (n: number) => `${n.toLocaleString("en-US")} online`,
    visitors: (n: number) =>
      `${n.toLocaleString("en-US")} ${n === 1 ? "visitor" : "visitors"} since launch`,
    clicks: (n: number) => `${n.toLocaleString("en-US")} ${n === 1 ? "click" : "clicks"} on bids`,
    seeStats: "see stats",
  },
  /** Public analytics dashboard the pill links to. "" hides the link. */
  statsUrl: "https://datafa.st/share/6a8efd8f7011d4b609dc823b",
  /** Accessible name for the card-wide link out to what a listing is promoting. */
  visit: (target: string) => `Visit ${target}`,
  /** The blink between the board and whatever a listing paid to promote. */
  leaving: "Leaving the board…",
  leavingGone: "That listing is gone. Back to the board.",
  backToBoard: "Back to the board",
  /** Clicks a single listing has sent to its target. */
  clicks: (n: number) => `${n.toLocaleString("en-US")} ${n === 1 ? "click" : "clicks"}`,

  footer: "A public receipt. Keep pretending the rank is marketing.",
  contactHeading: "Contact",
  contactLine: "One person runs this. Both of these reach him.",
  contactEmail: "dany@accura.dev",
  contactHandle: "@MajorBaguette",
  contactUrl: "https://x.com/MajorBaguette",

  termsNav: "Terms",
  termsTitle: "Terms",
  termsKicker: "What you are buying, and what you are not.",
  termsMetaDescription:
    "The terms of epenis.lol. $1 buys 1 cm of a public ranking that decays. Payments are final.",
  terms: [
    {
      heading: "What you are buying",
      body: "A position on a public board, priced in dollars and drawn as a length. $1 buys 1 cm. Rank is your current length, and it falls 1 cm an hour, so a position is rented, never owned. You are not buying advertising performance, an audience, or our endorsement of what you link to.",
    },
    {
      heading: "Payments are final",
      body: "Stripe takes the payment; we never see or store your card. Once a charge lands it is credited and it is not refunded — not for a change of mind, not because the board moved, not because you were outbid an hour later. That is the whole joke and also the whole product.",
    },
    {
      heading: "What you may list",
      body: "A URL or an X handle you are entitled to promote. No invite links, no pornography, nothing illegal, nothing that impersonates someone else. Your display name and one-line description are shown publicly next to what you paid.",
    },
    {
      heading: "We can take a listing down",
      body: "A listing that breaks the rule above can be hidden or removed without a refund. We would rather explain than surprise you, so write to us and we will.",
    },
    {
      heading: "No guarantees",
      body: "The board is offered as it is. It can be slow, wrong, briefly down, or discontinued. Ranking rules and prices can change. Nothing here promises uptime, traffic, clicks, or a particular position.",
    },
    {
      heading: "Liability",
      body: "To the extent the law allows, our liability for the board is limited to what you paid into it. Nothing in these terms removes rights you have that cannot be removed.",
    },
  ],

  privacyNav: "Privacy",
  privacyTitle: "Privacy",
  privacyKicker: "Almost nothing, and none of it secret.",
  privacyMetaDescription:
    "What epenis.lol collects: a listing, a payment record, a counter. No accounts, no profiles.",
  privacy: [
    {
      heading: "There are no accounts",
      body: "Sign-in is switched off. We never ask who you are, and there is nothing to log into.",
    },
    {
      heading: "What a listing stores",
      body: "The display name, the URL or handle, the one-line description, the total paid, and how many clicks it has sent. All of it is public on purpose — the board is a receipt.",
    },
    {
      heading: "Payments",
      body: "Stripe processes the card and holds that data under its own privacy policy. We keep only the amount and Stripe's session reference, which is what lets a payment be credited once and only once.",
    },
    {
      heading: "Analytics",
      body: "DataFast counts visits for us. We read one number back from it: how many visitors the site has ever had.",
    },
    {
      heading: "The live counter",
      body: "Your browser generates a random id, keeps it in local storage, and sends it every 30 seconds so the board can say how many people are here. It is not tied to a listing, a payment, or anything about you. Clearing site data throws it away and makes you a new visitor.",
    },
    {
      heading: "Requests your browser makes elsewhere",
      body: "Listing pictures come from unavatar.io and Google's favicon service, and the typefaces from Google Fonts. Loading them means your browser contacts those services directly, and they see your IP address. We do not send them anything else.",
    },
    {
      heading: "Clicks",
      body: "Following a listing's link adds one to that listing's counter. It is a number on the listing, not a record of you.",
    },
    {
      heading: "Asking us about your data",
      body: "Write to us and say what you want — a listing hidden, a description changed, a question answered. We will do it or tell you why we cannot.",
    },
  ],

  creditPrefix: "Shipped by",
  creditHandle: "@MajorBaguette",
  creditUrl: "https://x.com/MajorBaguette",
  creditSuffix: "He asked to be in the footer. We put him on the board instead. He asked again.",
  targetLabel: "URL or @handle",
  targetPlaceholder: "@levelsio or the SaaS you keep posting",
  nameLabel: "Display name",
  namePlaceholder: "Your real name, for once",
  lineLabel: "One line — pay to caption them",
  linePlaceholder: "the costume / the screenshot / the troll",
  floor: (n: number) => `Floor $${n}`,
  takeTopBtn: (n: number) => `Take #1 $${n}`,
  back: "Back to the board",
  missing: "No such listing. Maybe it was still pretending.",
  duel: "Duel",
  duelMark: "⚔️",
  duelKicker:
    "Free to open. Send the link. If they care, they pay. If they don't, they stay shorter in public.",
  duelVs: "vs",
  duelAhead: (name: string, cm: number) => `${name} is ${cm} cm longer. That's the screenshot.`,
  duelGap: (cm: number) => `+${cm.toLocaleString("en-US")}`,
  duelLonger: "cm longer",
  duelHolding: "holding it",
  duelTied: "Same size. Deeply awkward.",
  duelCopy: "Copy the evidence",
  duelCopied: "Copied. Go ruin their afternoon.",
  duelYou: "That's you",
  duelYouHint: "Which receipt is yours? Tap it. The link does the bullying.",
  duelThem: "The problem",
  duelYouSide: "You, allegedly",
  duelMissing: "$5 and you exist. Then you can measure.",
  duelSame: "That's the other guy. Pick the personality you actually paid for.",
  duelCatchUp: "Pay to not be shorter",
  duelOpen: "Make the link",
  duelChallenge: (name: string) => `Measure up vs ${name}`,

  /** Sharing. Newlines become real line breaks in the X compose box. */
  shareOnX: "Post on X",
  shareListing: (name: string, cm: number) =>
    [`Stop pretending.`, `It was always about size.`, `${name} is ${cm} cm.`, `What's yours?`].join(
      "\n",
    ),
  shareDuel: (a: string, aCm: number, b: string, bCm: number) =>
    [
      `Stop pretending.`,
      `It was always about size.`,
      `${a}: ${aCm} cm.`,
      `${b}: ${bCm} cm.`,
      `Choose who has the bigger.`,
    ].join("\n"),
  duelWho: "Which one is your little secret?",
  duelNew: "Still lurking, apparently",
  duelAs: (name: string) => `Send it as ${name}`,
  duelOther: "Wrong guy",
  duelFind: "name or @handle of the costume",
  duelNoHits: "Not on the board. $5 and you stop lurking.",
  duelIndexTitle: "Pick someone. Send the link.",
  duelIndexHint:
    "A duel is not this page. It's a URL with two names on it. ⚔️ Duel on a card, choose yourself, copy the evidence.",
  og: {
    unitRule: "$1 = 1 cm. Falls 1 cm an hour.",
    siteTag: "Public receipt",
    listingTag: (rank: number) => (rank > 0 ? `Rank #${rank}` : "Listing"),
    boardTag: (kind: "today" | "all-time") => (kind === "all-time" ? "All-time" : "Last 24 hours"),
    paid: (dollars: number) => `${usd(dollars)} paid`,
    takeTop: (dollars: number) => `${usd(dollars)} to take #1`,
    boardEmpty: "Nobody has paid. Five dollars and you're the only honest one.",
    duelTag: "Duel",
    winnerChip: "Longer",
    loserChip: "Still pretending",
    tieChip: "Dead even",
    verdict: (winner: string, times: string) =>
      `${winner} is ${times}× longer. That's the screenshot.`,
    verdictClose: (winner: string, cm: number) =>
      cm > 0 ? `${winner} is ${cm} cm longer. That's the screenshot.` : `${winner} leads. Barely.`,
    verdictTie: "Same size. Deeply awkward.",
    verdictSolo: (winner: string) => `${winner} paid. The other one is still pretending.`,
    flip: (dollars: number) => `${usd(dollars)} to flip it`,
    flipNone: "Nothing to flip. Nobody paid.",
  },
} as const;

export const quoteText = {
  invalidTarget: "That is not a URL or an X handle. Even a fake landing page has a URL.",
  belowMin: (min: number) => `Still pretending. Minimum is $${min}.`,
  topGap: (leader: number, needed: number) =>
    `#1 paid $${leader}. Pass with $${needed} or keep the costume.`,
  db: "Board is in demo mode until the database is wired. The act can wait.",
  mismatch: "That's the other guy. This card only pays for this receipt.",
  fail: "Something broke. You are still pretending.",
  ok: (charge: number, current: number, rank: number) => {
    const chargeLine = `You will be charged $${charge}.`;
    const currentLine = current > 0 ? ` Current total $${current}.` : "";
    const rankLine =
      rank === 1
        ? " You take #1. Enjoy it while it lasts."
        : ` Rank #${rank}. Still a little costume left.`;
    return `${chargeLine}${currentLine}${rankLine}`;
  },
};

export const rules = [
  "Rank is current length, not a screenshot. A centimetre you just paid holds for one hour. Then gravity. Pay to stay up.",
  "$1 = 1 cm. Whole dollars only. They called it a bid. It was always a ruler.",
  "A new listing starts at $5. Cheaper than the domain you bought to look busy.",
  "The number you enter is your lifetime total. You are charged the difference. Extra centimetres start leaking after that first hour.",
  "Raising costs at least $1 more than your current total. Honesty compounds. Gravity does too.",
  "Passing #1 costs at least $5 more than their current length. Catch them on the way down if you want.",
  "Equal length: the older listing stays higher. First to drop the act wins the tie.",
  "Same URL or same @handle is the same listing. You cannot fork a new personality.",
  "The card is the ad. Tapping it sends people to whatever you listed. That click is the only ROI that is real.",
  "Today ranks who still has something up from the last 24 hours. All-time ranks everyone still on the board.",
  "A duel is a link you send. Free. They pay only if they cannot stand being the shorter one on a URL with their name on it.",
  "Payments are final. No refunds. No “it was a bit”. No “it's just marketing”. It is the product.",
] as const;

export const about = [
  "The idea is clean: pay to stand above the others, in public, no algorithm. Genius. Then the users put a vest on it. Five figures to be #1. ROI screenshots. Pipeline. “It's advertising.” It was always a ruler.",
  "This board says that out loud. Rank is money. Money is length. $1 buys 1 cm. It holds for an hour, then it falls. The card is the ad — tapping it is the click. No categories. No costume. No feed pretending it isn't money.",
  "Same dollar. We named the centimetres. One person shipped it, paid, and is on the ruler with everyone else.",
] as const;

export const founder = {
  name: "Dany",
  handle: "@MajorBaguette",
  url: "https://x.com/MajorBaguette",
  targetType: "handle",
  targetKey: "handle:majorbaguette",
  targetUrl: "https://x.com/MajorBaguette",
  kicker: "The guy who named the centimetres",
  line: "He shipped the board. He paid to be on it. He asked to be in the footer. Gravity does not make an exception.",
  onBoard: "On the ruler, like everyone else",
  x: "The costume is the handle. The receipt is the board.",
  sitesKicker: "Also shipping. The algorithm still doesn't care.",
  sites: [
    {
      mark: "🧀",
      name: "Brieform",
      href: "https://brieform.app",
      line: "Forms your AI builds, publishes, and reads.",
    },
    {
      mark: "⚡",
      name: "DirectoryFast",
      href: "https://directoryfa.st",
      line: "A niche directory this afternoon.",
    },
    {
      mark: "⚔️",
      name: "Indiecraft",
      href: "https://indiecraft.quest",
      line: "The founders' armory.",
    },
  ],
} as const;

export function badgeFor(cents: number): string {
  if (cents >= 250000) return "seek help";
  if (cents >= 100000) return "unwell";
  if (cents >= 25000) return "whole personality";
  if (cents >= 10000) return "posted the roi";
  if (cents >= 5000) return "textbook average";
  if (cents >= 2000) return "almost a ruler";
  if (cents >= 500) return "the floor";
  return "still lurking";
}
