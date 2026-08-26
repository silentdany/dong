import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { copy } from "@/lib/copy";
import { ogAltText, ogText } from "@/lib/og/links";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () =>
    seoHead({
      title: `${copy.privacyTitle} — ${copy.siteName}`,
      description: copy.privacyMetaDescription,
      path: "/privacy",
      image: ogText({ tag: copy.privacyNav, title: copy.privacyTitle, sub: copy.privacyKicker }),
      imageAlt: ogAltText(copy.privacyTitle),
    }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPage title={copy.privacyTitle} kicker={copy.privacyKicker} sections={copy.privacy} />
  );
}
