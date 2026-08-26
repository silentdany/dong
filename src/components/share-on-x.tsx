import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy";
import { canonical } from "@/lib/seo";
import { cn } from "@/lib/utils";

/** X's own mark. lucide dropped brand icons, and a glyph would risk tofu. */
function XMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4 shrink-0 fill-current">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/**
 * Share to X. The URL is the canonical one, never the address bar's, so a
 * preview host or a link with tracking params still shares the real page —
 * which is also the page whose OG card X will render.
 */
export function ShareOnX({
  text,
  path,
  className,
}: {
  text: string;
  path: string;
  className?: string;
}) {
  const href = `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(
    canonical(path),
  )}`;

  return (
    <Button asChild variant="outline" className={cn("h-11", className)}>
      <a href={href} target="_blank" rel="noreferrer noopener">
        <XMark />
        {copy.shareOnX}
      </a>
    </Button>
  );
}
