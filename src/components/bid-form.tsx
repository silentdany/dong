import { useEffect, useMemo, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { AmountStepper } from "@/components/amount-stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { quoteBid, startCheckout } from "@/lib/board";
import { copy, quoteText } from "@/lib/copy";
import { costToTakeTop, NEW_LISTING_MIN } from "@/lib/ranking";

type Quote =
  | {
      ok: true;
      chargeDollars: number;
      currentDollars: number;
      projectedRank: number;
      existingName?: string | null;
      listingId?: string | null;
      live?: boolean;
    }
  | {
      ok: false;
      code: string;
      minDollars?: number;
      leaderDollars?: number;
      neededDollars?: number;
    };

type Props = {
  listingId?: string;
  lockedTarget?: string;
  defaultName?: string;
  defaultDescription?: string;
  defaultAmount?: number;
  leaderDollars: number;
  currentDollars?: number;
  duelOpponentId?: string;
  onDone?: () => void;
  onPaid?: (listingId: string) => void | Promise<void>;
  cmOnly?: boolean;
};

function quoteMessage(q: Quote | null) {
  if (!q) return null;
  if (q.ok) return quoteText.ok(q.chargeDollars, q.currentDollars, q.projectedRank);
  if (q.code === "invalid-target") return quoteText.invalidTarget;
  if (q.code === "listing-mismatch") return quoteText.mismatch;
  if (q.code === "below-min") return quoteText.belowMin(q.minDollars ?? NEW_LISTING_MIN);
  if (q.code === "top-gap") {
    return quoteText.topGap(q.leaderDollars ?? 0, q.neededDollars ?? 0);
  }
  if (q.code === "db-unavailable") return quoteText.db;
  return quoteText.fail;
}

export function BidForm({
  listingId,
  lockedTarget,
  defaultName = "",
  defaultDescription = "",
  defaultAmount,
  leaderDollars,
  currentDollars = 0,
  duelOpponentId,
  onDone,
  onPaid,
  cmOnly = false,
}: Props) {
  const router = useRouter();
  const minAmount = currentDollars > 0 ? currentDollars + 1 : NEW_LISTING_MIN;
  const [targetDraft, setTargetDraft] = useState(lockedTarget ?? "");
  const [displayName, setDisplayName] = useState(defaultName);
  const [description, setDescription] = useState(defaultDescription);
  const [amount, setAmount] = useState(defaultAmount ?? minAmount);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const target = lockedTarget ?? targetDraft;
  const takeTop = costToTakeTop(leaderDollars);
  const identityLocked =
    Boolean(listingId) || Boolean(lockedTarget) || currentDollars > 0 || Boolean(quote && quote.ok && quote.existingName);
  const receiptName = (quote && quote.ok && quote.existingName) || defaultName || displayName;

  useEffect(() => {
    if (quote && quote.ok && quote.existingName) setDisplayName(quote.existingName);
  }, [quote]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      if (!target.trim() || !Number.isInteger(amount) || amount < 1) {
        setQuote(null);
        return;
      }
      try {
        const result = await quoteBid({
          data: {
            listingId,
            target,
            displayName: displayName || "quote",
            description: "",
            amountDollars: amount,
          },
        });
        if (!controller.signal.aborted) setQuote(result as Quote);
      } catch {
        /* ignore */
      }
    }, 250);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [listingId, target, amount, displayName]);

  const canSubmit = Boolean(quote && quote.ok && target.trim() && displayName.trim());
  const hint = useMemo(() => quoteMessage(quote), [quote]);

  async function confirm() {
    if (!quote || !quote.ok) return;
    setSubmitting(true);
    try {
      const result = await startCheckout({
        data: {
          listingId,
          target,
          displayName,
          description,
          amountDollars: amount,
          returnPath: typeof window !== "undefined" ? window.location.pathname : "/",
          duelOpponentId,
        },
      });
      if (result.ok && "url" in result && result.url) {
        window.location.assign(result.url);
        return;
      }
      if (result.ok && result.listingId) {
        setConfirmOpen(false);
        await router.invalidate();
        if (onPaid) {
          await onPaid(result.listingId);
          onDone?.();
          return;
        }
        onDone?.();
        await router.navigate({ to: "/", search: { paid: "1", l: result.listingId } });
        return;
      }
      setQuote(result as Quote);
      setConfirmOpen(false);
    } catch {
      setQuote({ ok: false, code: "fail" });
      setConfirmOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (canSubmit) setConfirmOpen(true);
      }}
    >
      {!cmOnly ? (
        <>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`target-${listingId ?? "new"}`}>{copy.targetLabel}</Label>
            <Input
              id={`target-${listingId ?? "new"}`}
              required
              value={target}
              readOnly={Boolean(lockedTarget) || Boolean(listingId)}
              autoComplete="url"
              placeholder={copy.targetPlaceholder}
              onChange={(event) => setTargetDraft(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`name-${listingId ?? "new"}`}>{copy.nameLabel}</Label>
            <Input
              id={`name-${listingId ?? "new"}`}
              required
              maxLength={40}
              value={displayName}
              readOnly={identityLocked}
              autoComplete="off"
              placeholder={copy.namePlaceholder}
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`line-${listingId ?? "new"}`}>{copy.lineLabel}</Label>
            <Input
              id={`line-${listingId ?? "new"}`}
              maxLength={140}
              value={description}
              autoComplete="off"
              placeholder={copy.linePlaceholder}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
        </>
      ) : (
        <p className="text-sm font-medium text-fg">{copy.confirmWho(receiptName || "this listing")}</p>
      )}

      <div className="rounded-md bg-bg p-4">
        <AmountStepper value={amount} min={1} onChange={setAmount} />
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setAmount(minAmount)}>
            {copy.floor(minAmount)}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setAmount(takeTop)}>
            {copy.takeTopBtn(takeTop)}
          </Button>
        </div>
      </div>

      {hint ? (
        <p className={`text-sm ${quote && !quote.ok ? "text-danger" : "text-muted"}`}>{hint}</p>
      ) : null}

      <Button type="submit" size="xl" className="w-full" disabled={!canSubmit}>
        {copy.buy}
      </Button>
      <p className="text-xs text-subtle">{copy.noRefunds}</p>

      {confirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-bg/70 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-xl bg-elevated p-5 shadow-soft">
            <p className="font-display text-2xl leading-tight text-fg">
              {copy.confirmTitle(amount, receiptName || undefined)}
            </p>
            {receiptName ? (
              <p className="mt-2 text-sm font-medium text-fg">{copy.confirmWho(receiptName)}</p>
            ) : null}
            <p className="mt-2 text-sm text-muted">
              {quote && quote.ok && quote.live ? copy.cardNext : copy.demoPay}
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
              <Button type="button" className="flex-1" disabled={submitting} onClick={confirm}>
                {submitting ? copy.submitting : copy.confirmPay}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => setConfirmOpen(false)}
              >
                {copy.cancel}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}
