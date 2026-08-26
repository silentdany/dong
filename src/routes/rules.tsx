import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { copy, rules } from "@/lib/copy";
import { ogAltText, ogText } from "@/lib/og/links";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/rules")({
  head: () =>
    seoHead({
      title: `${copy.rulesTitle} — ${copy.siteName}`,
      description: copy.rulesMetaDescription,
      path: "/rules",
      image: ogText({ tag: copy.rulesNav, title: copy.rulesTitle, sub: copy.rulesKicker }),
      imageAlt: ogAltText(copy.rulesTitle),
    }),
  component: RulesPage,
});

function RulesPage() {
  return (
    <AppShell>
      <h1 className="font-display text-4xl leading-tight text-fg">{copy.rulesTitle}</h1>
      <p className="mt-2 text-sm text-muted">{copy.rulesKicker}</p>
      <ol className="mt-8 space-y-4">
        {rules.map((rule, index) => (
          <li key={rule} className="flex gap-3 text-sm leading-relaxed text-fg">
            <span className="w-6 shrink-0 tabular-nums text-muted">{index + 1}.</span>
            <span>{rule}</span>
          </li>
        ))}
      </ol>
    </AppShell>
  );
}
