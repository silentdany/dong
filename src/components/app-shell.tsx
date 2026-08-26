import type { ReactNode } from "react";
import { LiveStatsPill } from "@/components/live-stats";
import { SiteHeader } from "@/components/site-header";
import { copy } from "@/lib/copy";

export function AppShell({
  children,
  footerPad,
}: {
  children: ReactNode;
  footerPad?: boolean;
}) {
  return (
    <div
      className={`mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 ${
        footerPad ? "pb-32" : "pb-8"
      }`}
    >
      <SiteHeader />
      <main className="flex-1 pt-6">{children}</main>
      <div className="mt-10 flex justify-center">
        <LiveStatsPill href={copy.statsUrl} />
      </div>
      <footer className="mt-6 border-t border-border pt-4 text-xs leading-relaxed text-subtle">
        <p>{copy.footer}</p>
        <p className="mt-2">
          {copy.creditPrefix}{" "}
          <a
            href={copy.creditUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="font-medium text-muted underline decoration-border underline-offset-2 transition-colors duration-150 hover:text-fg"
          >
            {copy.creditHandle}
          </a>
          . {copy.creditSuffix}
        </p>
      </footer>
    </div>
  );
}
