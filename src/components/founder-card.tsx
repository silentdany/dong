import { Link } from "@tanstack/react-router";
import { ListingLogo } from "@/components/listing-logo";
import { founder } from "@/lib/copy";

export function FounderCard({ listingId }: { listingId?: string | null }) {
  return (
    <article className="rounded-lg bg-elevated p-5 ring-1 ring-fill/40">
      <div className="flex items-center gap-3">
        <ListingLogo
          type={founder.targetType}
          targetKey={founder.targetKey}
          targetUrl={founder.targetUrl}
          name={founder.name}
          size="lg"
        />
        <div className="min-w-0">
          <p className="font-display text-2xl leading-none tracking-tight text-fg">{founder.name}</p>
          <a
            href={founder.url}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-1 inline-block text-sm font-medium text-accent underline-offset-2 hover:underline"
          >
            {founder.handle}
          </a>
        </div>
      </div>
      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted">{founder.kicker}</p>
      <p className="mt-2 text-sm leading-relaxed text-fg">{founder.line}</p>
      <p className="mt-3 text-sm text-muted">{founder.x}</p>
      {listingId ? (
        <Link
          to="/l/$id"
          params={{ id: listingId }}
          className="mt-4 inline-flex text-sm font-medium text-accent underline-offset-2 hover:underline"
        >
          {founder.onBoard}
        </Link>
      ) : null}
    </article>
  );
}
