import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy";

type Props = {
  value: number;
  onChange: (next: number) => void;
  min?: number;
};

export function AmountStepper({ value, onChange, min = 1 }: Props) {
  return (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="size-14 shrink-0 rounded-md"
        aria-label="Decrease by one dollar"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus className="size-5" />
      </Button>
      <div className="min-w-0 flex-1 text-center">
        <p className="font-display text-5xl leading-none tabular-nums tracking-tight text-fg">
          {Number.isFinite(value) ? value : min}
        </p>
        <p className="mt-1 text-sm text-muted">{copy.unitHint}</p>
      </div>
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="size-14 shrink-0 rounded-md"
        aria-label="Increase by one dollar"
        onClick={() => onChange(value + 1)}
      >
        <Plus className="size-5" />
      </Button>
    </div>
  );
}
