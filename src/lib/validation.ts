import { z } from 'zod'

export const bidSchema = z.object({
  target: z.string().trim().min(1).max(300),
  displayName: z.string().trim().min(1).max(40),
  description: z.string().trim().max(140).default(''),
  // Whole dollars only, and never trusted as a price -- the server recomputes
  // the charge from this against the stored lifetime total.
  amountDollars: z.coerce.number().int().min(1).max(1_000_000),
})

export type BidInput = z.infer<typeof bidSchema>

export const hideSchema = z.object({
  key: z.string().min(1),
  id: z.string().min(1),
  hidden: z.boolean().default(true),
})
