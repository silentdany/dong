/**
 * Every user-facing string lives here. Components import `copy` and never
 * inline a literal. Rebranding the product = editing this file and
 * config/theme.ts. See RESKIN.md.
 */

const usd = (dollars: number) => `$${dollars.toLocaleString('en-US')}`

export const copy = {
  siteName: 'length.lol',
  domain: 'length.lol',

  tagline: 'The leaderboard that is honest about what it measures.',
  description:
    'Pay money, get length. The longest listing sits at the top. No algorithm, no quality score, no appeal.',

  ctaPrimary: 'Measure me',
  ctaRaise: 'Add length',

  unitName: 'cm',
  unitLabel: (n: number) => `${n.toLocaleString('en-US')} cm`,

  boardToday: 'Today',
  boardAllTime: 'All-time',

  claimNumberOne: (dollars: number) => `#1 costs ${usd(dollars)} right now`,
  newListingHint: (dollars: number) =>
    `New listings start at ${usd(dollars)}. $1 buys 1 cm. Whole dollars only.`,

  rulesTitle: 'Rules',
  rules: [
    'Rank is total money paid. Nothing else counts.',
    '$1 = 1 cm. Whole dollars only.',
    'A new listing starts at $5.',
    'The number you enter is your lifetime total. You are charged the difference.',
    'Raising costs at least $1 more than your current total.',
    'Passing #1 costs at least $5 more than their total. Pay less and you land wherever that buys.',
    'Equal totals: the older listing stays higher.',
    'Same URL or same @handle is the same listing.',
    'Today ranks the last 24 hours of payments. All-time ranks everything.',
    'Payments are final. There are no refunds.',
    'Product URLs and X handles only. Invite links and porn are removed without refund.',
  ],

  about:
    'A pay-to-rank advertising board. You buy a position, everyone sees exactly what it cost you, and the only leverage anyone has is a card. It is an auction wearing a joke as a hat.',

  footer: 'A public auction for attention. Not affiliated with anyone measured.',

  ogTitle: 'length.lol — pay to be long',
  ogDescription: 'A public leaderboard ranked only by money paid. $1 = 1 cm.',

  successTitle: 'Paid. You grew.',
  cancelTitle: 'Cancelled. You stayed exactly the same.',

  /** Everything below is UI chrome, still skinnable, still not hardcoded. */
  ui: {
    boardEmpty: 'nobody has paid yet. #1 costs $5',
    rank: 'Rank',
    clicks: (n: number) => `${n.toLocaleString('en-US')} clicks`,
    total: (dollars: number) => usd(dollars),
    justPaid: 'Payment received. This board updates the moment Stripe confirms.',
    backToBoard: 'Back to the board',
    detailTitle: (name: string) => `${name} on ${copy.siteName}`,
    navRules: 'Rules',
    navAbout: 'About',
    successBody: 'Your length is being applied. The board refreshes in a second.',
    cancelBody: 'No charge was made. Your listing is untouched.',
  },

  form: {
    legend: 'Buy length',
    targetLabel: 'URL or @handle',
    targetPlaceholder: 'https://yourthing.com or @yourhandle',
    nameLabel: 'Display name',
    namePlaceholder: 'What to call it',
    descriptionLabel: 'One line (optional)',
    descriptionPlaceholder: 'What it is, in 140 characters',
    amountLabel: 'Your lifetime total, in dollars',
    submit: 'Continue to payment',
    submitting: 'Opening Stripe…',
    quoteCharge: (dollars: number) => `You will be charged ${usd(dollars)} now.`,
    quoteCurrent: (dollars: number) => `This listing has already paid ${usd(dollars)}.`,
    quoteRank: (rank: number) => `That buys rank #${rank}.`,
    noRefunds: 'Payments are final.',
  },

  errors: {
    generic: 'Something broke. Nothing was charged.',
    invalidTarget: 'That is not a URL or an X handle.',
    blockedTarget: 'That kind of link is not allowed here.',
    belowMin: (dollars: number) => `Minimum is ${usd(dollars)}.`,
    topGap: (leader: number, needed: number) =>
      `#1 has ${usd(leader)}. Pass them with ${usd(needed)} or more, or pay ${usd(leader)} or less and take a lower rank.`,
    notFound: 'No such listing.',
  },
} as const

export type Copy = typeof copy
