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
  borderRadius: '8px',
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
  const [amount, setAmount] = useState(defaultAmount ? String(defaultAmount) : '5')
  const [quote, setQuote] = useState<Quote | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const amountNumber = Number(amount) || 0

  // Quote is always recomputed server-side; the client never prices anything.
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
    const cleaned = raw.replace(/[^0-9]/g, '')
    setAmount(cleaned)
  }

  function bump(delta: number) {
    const next = Math.max(1, (Number(amount) || 0) + delta)
    setAmount(String(next))
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

      <div className="flex flex-col gap-1 text-sm">
        <span className="font-medium">{copy.form.amountLabel}</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={copy.form.decrease}
            disabled={amountNumber <= 1}
            onClick={() => bump(-1)}
            className="flex size-14 shrink-0 items-center justify-center text-2xl disabled:opacity-40"
            style={{ background: 'var(--l-track)', borderRadius: '8px' }}
          >
            −
          </button>
          <div className="min-w-0 flex-1 text-center">
            <input
              required
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              value={amount}
              onChange={(event) => onAmountChange(event.target.value)}
              className="w-full bg-transparent text-center font-display text-5xl leading-none tabular-nums tracking-tight outline-none"
              aria-label={copy.form.amountLabel}
            />
            <p className="mt-1 text-sm" style={{ color: 'var(--l-muted)' }}>
              {copy.unitHint}
            </p>
          </div>
          <button
            type="button"
            aria-label={copy.form.increase}
            onClick={() => bump(1)}
            className="flex size-14 shrink-0 items-center justify-center text-2xl"
            style={{ background: 'var(--l-track)', borderRadius: '8px' }}
          >
            +
          </button>
        </div>
      </div>

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
        style={{ background: 'var(--l-accent)', color: 'var(--l-accentInk)', borderRadius: '8px' }}
      >
        {submitting ? copy.form.submitting : copy.form.submit}
      </button>

      <p className="text-xs" style={{ color: 'var(--l-muted)' }}>
        {copy.form.noRefunds}
      </p>
    </form>
  )
}
