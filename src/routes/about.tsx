import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { about, copy } from "@/lib/copy";
import { ogAltText, ogText } from "@/lib/og/links";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () =>
    seoHead({
      title: `${copy.aboutTitle} — ${copy.siteName}`,
      description: copy.aboutMetaDescription,
      path: "/about",
      image: ogText({ tag: copy.aboutNav, title: copy.aboutTitle, sub: copy.aboutMetaDescription }),
      imageAlt: ogAltText(copy.aboutTitle),
    }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <AppShell>
      <h1 className="font-display text-4xl leading-tight text-fg">{copy.aboutTitle}</h1>
      <div className="mt-6 flex max-w-prose flex-col gap-4">
        {about.map((graf) => (
          <p key={graf} className="text-base leading-relaxed text-fg">
            {graf}
          </p>
        ))}
      </div>
    </AppShell>
  );
}
