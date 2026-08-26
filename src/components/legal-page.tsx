import { AppShell } from "@/components/app-shell";
import { copy } from "@/lib/copy";

export type LegalSection = { heading: string; body: string };

/** /terms and /privacy: a title, a line, plain sections, and a way to reach a human. */
export function LegalPage({
  title,
  kicker,
  sections,
}: {
  title: string;
  kicker: string;
  sections: readonly LegalSection[];
}) {
  return (
    <AppShell>
      <h1 className="font-display text-4xl leading-tight text-fg">{title}</h1>
      <p className="mt-2 text-sm text-muted">{kicker}</p>

      <div className="mt-8 space-y-6">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-sm font-semibold text-fg">{section.heading}</h2>
            <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-muted">{section.body}</p>
          </section>
        ))}

        <section>
          <h2 className="text-sm font-semibold text-fg">{copy.contactHeading}</h2>
          <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-muted">
            {copy.contactLine}{" "}
            <a
              href={`mailto:${copy.contactEmail}`}
              className="text-accent underline underline-offset-2"
            >
              {copy.contactEmail}
            </a>{" "}
            ·{" "}
            <a
              href={copy.contactUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="text-accent underline underline-offset-2"
            >
              {copy.contactHandle}
            </a>
          </p>
        </section>
      </div>
    </AppShell>
  );
}
