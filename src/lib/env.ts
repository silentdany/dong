function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing env var ${name}`)
  return value
}

export const env = {
  stripeSecretKey: () => required('STRIPE_SECRET_KEY'),
  stripeWebhookSecret: () => required('STRIPE_WEBHOOK_SECRET'),
  adminKey: () => process.env.ADMIN_KEY ?? '',
}

export function baseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_BASE_URL
  if (fromEnv) return fromEnv.replace(/\/+$/, '')
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}
