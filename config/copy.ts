/**
 * Every user-facing string lives here. Components import `copy` and never
 * inline a literal. Rebranding the product = editing this file and
 * config/theme.ts. See RESKIN.md.
 */

const usd = (dollars: number) => `$${dollars.toLocaleString('en-US')}`

export const copy = {
  siteName: 'epenis.lol',
  domain: 'epenis.lol',

  tagline: 'Rank is length. Pay to grow.',
  description:
    'The only leaderboard honest about what it measures. $1 = 1 cm. No algorithm, no cope, no feelings. Just money and centimetres.',

  ctaPrimary: 'Make me longer',
  ctaRaise: 'Pump it',

  unitName: 'cm',
  unitLabel: (n: number) => `${n.toLocaleString('en-US')} cm`,

  boardToday: 'Today',
  boardAllTime: 'All-time',

  claimNumberOne: (dollars: number) => `to dethrone #1: ${usd(dollars)}. cash only.`,
  newListingHint: (dollars: number) =>
    `New entries start at ${usd(dollars)}. $1 = 1 cm. Whole dollars only. No feelings allowed.`,

  rulesTitle: 'The rules (read them, coward)',
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
    'Payments are final. There are no refunds. Ever.',
    'Product URLs and X handles only. Invite links and porn are removed without refund.',
  ],

  about:
    'A public auction for length. You buy centimetres with real money, everyone sees exactly how much you paid, and the only leverage anyone has is a credit card. It is an advertising board wearing a joke as a hat. The joke is you.',

  footer: 'A public auction for attention. Not affiliated with anyone measured. Cope harder.',

  ogTitle: 'epenis.lol — rank is length',
  ogDescription: 'Pay money, get length. The longest sits at the top. $1 = 1 cm. No cope.',

  successTitle: 'Paid. You grew. Congrats I guess.',
  cancelTitle: 'Cancelled. You stayed the same size. Classic.',

  ui: {
    boardEmpty: 'the board is empty. #1 is still available for $5. someone has to go first.',
    rank: 'Rank',
    clicks: (n: number) => `${n.toLocaleString('en-US')} clicks`,
    total: (dollars: number) => usd(dollars),
    justPaid: 'Payment received. Stripe is the only truth here.',
    backToBoard: 'Back to the board',
    detailTitle: (name: string) => `${name} on ${copy.siteName}`,
    navRules: 'Rules',
    navAbout: 'About',
    successBody: 'Your length is being applied. The board updates when Stripe confirms. Patience.',
    cancelBody: 'No charge was made. Your listing is untouched. You can try again when you grow a pair.',
  },

  form: {
    legend: 'Buy length',
    targetLabel: 'URL or @handle',
    targetPlaceholder: 'https://yourthing.com or @yourhandle',
    nameLabel: 'Display name',
    namePlaceholder: 'What the world will call it',
    descriptionLabel: 'One line (optional)',
    descriptionPlaceholder: 'Cope, flex, or whatever. 140 chars max.',
    amountLabel: 'Your lifetime total in dollars',
    submit: 'Continue to payment',
    submitting: 'Opening Stripe…',
    quoteCharge: (dollars: number) => `You will be charged ${usd(dollars)} now.`,
    quoteCurrent: (dollars: number) => `This listing has already paid ${usd(dollars)}.`,
    quoteRank: (rank: number) => `That buys rank #${rank}.`,
    noRefunds: 'Payments are final. No refunds. No cope.',
  },

  errors: {
    generic: 'Something broke. Nothing was charged. Lucky you.',
    invalidTarget: 'That is not a URL or an X handle.',
    blockedTarget: 'That kind of link is not allowed here.',
    belowMin: (dollars: number) => `Minimum is ${usd(dollars)}. Come on.`,
    topGap: (leader: number, needed: number) =>
      `#1 has ${usd(leader)}. Pass them with ${usd(needed)} or more, or pay ${usd(leader)} or less and take a lower rank.`,
    notFound: 'No such listing. Maybe it was hidden. Or never existed.',
  },
} as const

export type Copy = typeof copy
