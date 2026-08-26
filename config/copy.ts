/**
 * Every user-facing string lives here. Components import `copy` and never
 * inline a literal. Rebranding the product = editing this file and
 * config/theme.ts. See RESKIN.md.
 */

const usd = (dollars: number) => `$${dollars.toLocaleString('en-US')}`

export const copy = {
  siteName: 'epenis.lol',
  domain: 'epenis.lol',
  logo: '🍆',

  tagline: 'Stop pretending.',
  kicker: 'You already paid to be taller. We named the unit.',
  description:
    'You screenshot the rank. You post the ROI. You call it pipeline. It was always a ruler. $1 buys 1 mm. You cannot fake a charge.',

  ctaPrimary: 'Pay for real',
  ctaRaise: 'Come clean',

  unitName: 'mm',
  unitLabel: (n: number) => `${n.toLocaleString('en-US')} mm`,
  unitHint: 'mm, paid',

  boardToday: 'Today',
  boardAllTime: 'All-time',

  claimNumberOne: (dollars: number) => `${usd(dollars)} to stop pretending you're #1`,
  leaderLine: (mm: number) =>
    mm > 0 ? `#1 stopped pretending at ${mm} mm.` : 'Nobody has paid. The costume is still on.',
  newListingHint: (dollars: number) =>
    `New entries start at ${usd(dollars)}. $1 buys 1 mm. Whole dollars only. The costume is extra.`,

  rulesTitle: 'The rules',
  rulesKicker: 'No costume. No screenshots. Pay.',
  rules: [
    'Rank is total money paid. Followers, ARR, and “just shipped” are costumes.',
    '$1 = 1 mm. Whole dollars only. They called it a bid. It was always a ruler.',
    'A new listing starts at $5. Cheaper than the domain you bought to look busy.',
    'The number you enter is your lifetime total. You are charged the difference.',
    'Raising costs at least $1 more than your current total. Honesty compounds.',
    'Passing #1 costs at least $5 more than their total. Pay less and you land wherever that buys. Still pretending.',
    'Equal totals: the older listing stays higher. First to drop the act wins the tie.',
    'Same URL or same @handle is the same listing. You cannot fork a new personality.',
    'Today ranks the last 24 hours of payments. All-time ranks who dropped the act.',
    'Payments are final. No refunds. No “it was a bit”. No “it\'s just marketing”. It is the product.',
    'Product URLs and X handles only. Invite links and porn are removed without refund.',
  ],

  aboutTitle: 'About',
  aboutGrafs: [
    'The idea is clean: pay to stand above the others, in public, no algorithm. Genius. Then the users put a vest on it. Five figures to be #1. ROI screenshots. Pipeline. “It\'s advertising.” It was always a ruler.',
    'This board says that out loud. Rank is money. Money is length. $1 buys 1 mm. No categories. No costume.',
    'Same dollar. We named the millimetres.',
  ],
  about:
    'The idea is clean: pay to stand above the others, in public, no algorithm. Genius. Then the users put a vest on it. Five figures to be #1. ROI screenshots. Pipeline. “It\'s advertising.” It was always a ruler. This board says that out loud. Rank is money. Money is length. $1 buys 1 mm. No categories. No costume.',

  footer: 'A public receipt. Keep pretending the rank is marketing.',

  ogTitle: 'Stop pretending. — epenis.lol',
  ogDescription: 'You already paid to be taller. We named the unit. $1 = 1 mm.',

  successTitle: 'Paid. That\'s the only screenshot that counts.',
  cancelTitle: 'Cancelled. You kept pretending. Classic.',

  ui: {
    boardEmpty: 'Nobody has paid yet. Five dollars and you\'re the only one who stopped pretending. That\'s the joke.',
    rank: 'Rank',
    clicks: (n: number) => `${n.toLocaleString('en-US')} clicks`,
    total: (dollars: number) => usd(dollars),
    justPaid: 'Paid. That\'s the only screenshot that counts.',
    backToBoard: 'Back to the board',
    detailTitle: (name: string) => `${name} on ${copy.siteName}`,
    navRules: 'Rules',
    navAbout: 'About',
    successBody: 'Stripe is applying the millimetres. The board updates when the charge lands.',
    cancelBody: 'No charge was made. Your listing is untouched. The costume is still on.',
  },

  form: {
    legend: 'Pay for real',
    targetLabel: 'URL or @handle',
    targetPlaceholder: '@levelsio or the SaaS you keep posting',
    nameLabel: 'Display name',
    namePlaceholder: 'Your real name, for once',
    descriptionLabel: 'One line (optional)',
    descriptionPlaceholder: 'the costume / the screenshot / the truth',
    amountLabel: 'Your lifetime total in dollars',
    submit: 'Continue to payment',
    submitting: 'Opening Stripe…',
    quoteCharge: (dollars: number) => `You will be charged ${usd(dollars)} now.`,
    quoteCurrent: (dollars: number) => `This listing has already paid ${usd(dollars)}.`,
    quoteRank: (rank: number) =>
      rank === 1 ? 'You take #1. The pretending stops.' : `That buys rank #${rank}. A little costume left.`,
    noRefunds: 'Final. No refunds. Pretending is free. This is not.',
    decrease: 'Decrease by one dollar',
    increase: 'Increase by one dollar',
  },

  errors: {
    generic: 'Something broke. Nothing was charged. You are still pretending.',
    invalidTarget: 'That is not a URL or an X handle. Even a fake landing page has a URL.',
    blockedTarget: 'That kind of link is not allowed here.',
    belowMin: (dollars: number) => `Still pretending. Minimum is ${usd(dollars)}.`,
    topGap: (leader: number, needed: number) =>
      `#1 paid ${usd(leader)}. Pass with ${usd(needed)} or keep the costume.`,
    notFound: 'No such listing. Maybe it was still pretending.',
  },
} as const

export type Copy = typeof copy
