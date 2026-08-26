import { useState } from "react";
import { Drawer } from "vaul";
import { BidForm } from "@/components/bid-form";
import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy";
import { costToTakeTop } from "@/lib/ranking";

type Props = {
  leaderDollars: number;
};

export function BidDrawer({ leaderDollars }: Props) {
  const [open, setOpen] = useState(false);
  const takeTop = costToTakeTop(leaderDollars);

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="pointer-events-auto mx-auto flex max-w-lg items-center gap-3 rounded-xl border border-border bg-elevated/95 p-3 shadow-soft backdrop-blur-sm">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted">{copy.leaderLine(leaderDollars)}</p>
            <p className="truncate text-sm font-medium text-fg">{copy.takeTop(takeTop)}</p>
          </div>
          <Button type="button" onClick={() => setOpen(true)}>
            {copy.buy}
          </Button>
        </div>
      </div>

      <Drawer.Root open={open} onOpenChange={setOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-50 bg-bg/70" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-xl bg-surface outline-none">
            <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-border-strong" />
            <div className="overflow-y-auto px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4">
              <Drawer.Title className="font-display text-3xl leading-none text-fg">
                {copy.buy}
              </Drawer.Title>
              <p className="mb-5 mt-2 text-sm text-muted">{copy.drawerHint}</p>
              <BidForm
                leaderDollars={leaderDollars}
                defaultAmount={takeTop}
                onDone={() => setOpen(false)}
              />
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}
