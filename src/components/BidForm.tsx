'use client'

import { useEffect, useState } from 'react'
import { copy } from '@config/copy'

type Props = {
  lockedTarget?: string
  defaultName?: string
  defaultDescription?: string
  defaultAmount?: number
}

type Quote = {
  chargeDollars: number
  currentDollars: number
  projectedRank: number
}

const inputStyle = {
  background: 'var(--l-bg)',
  borderColor: 'var(--l-track)',
  borderRadius: 'var(--l-radius)',
} as const

function messageFor(payload: { code?: string; minDollars?: number; leaderDollars?: number; neededDollars?: number }): string {
  switch (payload.code) {
    case 'invalid-target':
    case 'invalid-input':
      return copy.errors.invalidTarget
    case 'blocked-target':
      return copy.errors.blockedTarget
    case 'below-min':
      return copy.errors.belowMin(payload.minDollars ?? 0)
    case 'top-gap':
      return copy.errors.topGap(payload.leaderDollars ?? 0, payload.neededDollars ?? 0)
    default:
      return copy.errors.generic
  }
}

export default function BidForm({ lockedTarget, defaultName = '', defaultDescription = '', defaultAmount }: Props) {
  const [target, setTarget] = useState(lockedTarget ?? '')
  const [displayName, setDisplayName] = useState(defaultName)
  const [description, setDescription] = useState(defaultDescription)
  const [amount, setAmount] = useState(defaultAmount ? String(defaultAmount) : '')
  const [quote, setQuote] = useState<Quote | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Quote is always recomputed server-side; the client never prices anything.
  // Only the target and the amount move the price, so the text fields stay out
  // of the dependency list and out of the request.
  useEffect(() => {
    const controller = new AbortController()

    const timer = setTimeout(async () => {
      const amountDollars = Number(amount)
      if (!target.trim() || !Number.isInteger(amountDollars) || amountDollars < 1) {
        setQuote(null)
        return
      }

      try {
        const response = await fetch('/api/quote', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ target, displayName: 'quote', description: '', amountDollars }),
          signal: controller.signal,
        })
        const payload = await response.json()
        if (payload.ok) {
          setQuote(payload)
          setError(null)
        } else {
          setQuote(null)
          setError(messageFor(payload))
        }
      } catch {
        /* aborted or offline: leave the last state alone */
      }
    }, 350)

    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [target, amount])

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ target, displayName, description, amountDollars: Number(amount) }),
      })
      const payload = await response.json()
      if (payload.ok && payload.url) {
        window.location.href = payload.url
        return
      }
      setError(messageFor(payload))
    } catch {
      setError(copy.errors.generic)
    }
    setSubmitting(false)
  }

  function onAmountChange(raw: string) {
    // Keep only digits so mobile keyboards can't invent steps of 5 or decimals.
    const cleaned = raw.replace(/[^0-9]/g, '')
    setAmount(cleaned)
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">{copy.form.targetLabel}</span>
        <input
          required
          value={target}
          readOnly={Boolean(lockedTarget)}
          onChange={(event) => setTarget(event.target.value)}
          placeholder={copy.form.targetPlaceholder}
          autoComplete="url"
          className="border px-3 py-2.5 text-base read-only:opacity-70"
          style={inputStyle}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">{copy.form.nameLabel}</span>
        <input
          required
          maxLength={40}
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder={copy.form.namePlaceholder}
          autoComplete="off"
          className="border px-3 py-2.5 text-base"
          style={inputStyle}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">{copy.form.descriptionLabel}</span>
        <input
          maxLength={140}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder={copy.form.descriptionPlaceholder}
          autoComplete="off"
          className="border px-3 py-2.5 text-base"
          style={inputStyle}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">{copy.form.amountLabel}</span>
        <input
          required
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          value={amount}
          onChange={(event) => onAmountChange(event.target.value)}
          placeholder="5"
          className="border px-3 py-2.5 text-base tabular-nums"
          style={inputStyle}
        />
      </label>

      {quote ? (
        <p className="text-sm" style={{ color: 'var(--l-ink)' }}>
          {copy.form.quoteCharge(quote.chargeDollars)}{' '}
          <span style={{ color: 'var(--l-muted)' }}>
            {quote.currentDollars > 0 ? `${copy.form.quoteCurrent(quote.currentDollars)} ` : ''}
            {copy.form.quoteRank(quote.projectedRank)}
          </span>
        </p>
      ) : null}

      {error ? (
        <p className="text-sm" style={{ color: 'var(--l-danger)' }} role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting || !quote}
        className="px-4 py-3.5 text-base font-semibold disabled:opacity-50"
        style={{ background: 'var(--l-accent)', color: 'var(--l-accentInk)', borderRadius: 'var(--l-radius)' }}
      >
        {submitting ? copy.form.submitting : copy.form.submit}
      </button>

      <p className="text-xs" style={{ color: 'var(--l-muted)' }}>
        {copy.form.noRefunds}
      </p>
    </form>
  )
}
