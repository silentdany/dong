import { z } from "zod";

/** Query flags Stripe and the app both write as 1. The router parses that as a number. */
const queryFlag = z
  .union([z.string(), z.number(), z.boolean()])
  .optional()
  .transform((value) => (value === undefined ? undefined : String(value)));

export const paidSearch = z.object({
  paid: queryFlag,
  l: queryFlag,
});
