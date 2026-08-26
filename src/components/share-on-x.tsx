import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy";
import { canonical } from "@/lib/seo";
import { cn } from "@/lib/utils";

/** X's own mark. lucide dropped brand icons, and a glyph would risk tofu. */
function XMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("size-4 shrink-0 fill-current", className)}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function intentHref(text: string, path: string) {
  return `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(
    canonical(path),
  )}`;
}

/**
 * Share to X. The URL is the canonical one, never the address bar's, so a
 * preview host or a link with tracking params still shares the real page —
 * which is also the page whose OG card X will render.
 *
 * `compact` is the board-row treatment: same weight as Add cm / Duel, no outline
 * button eating the card.
 */
export function ShareOnX({
  text,
  path,
  className,
  compact = false,
}: {
  text: string;
  path: string;
  className?: string;
  compact?: boolean;
}) {
  const href = intentHref(text, path);

  if (compact) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className={cn(
          "relative z-10 inline-flex items-center gap-1.5 py-1.5 font-medium text-fg underline-offset-2 hover:underline",
          className,
        )}
      >
        <XMark className="size-3.5" />
        {copy.shareOnX}
      </a>
    );
  }

  return (
    <Button asChild variant="outline" className={cn("h-11", className)}>
      <a href={href} target="_blank" rel="noreferrer noopener">
        <XMark />
        {copy.shareOnX}
      </a>
    </Button>
  );
}
