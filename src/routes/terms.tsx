import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { copy } from "@/lib/copy";
import { ogAltText, ogText } from "@/lib/og/links";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () =>
    seoHead({
      title: `${copy.termsTitle} — ${copy.siteName}`,
      description: copy.termsMetaDescription,
      path: "/terms",
      image: ogText({ tag: copy.termsNav, title: copy.termsTitle, sub: copy.termsKicker }),
      imageAlt: ogAltText(copy.termsTitle),
    }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPage title={copy.termsTitle} kicker={copy.termsKicker} sections={copy.terms} />
  );
}
