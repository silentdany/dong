import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'
import { copy } from '@config/copy'
import ThemeStyle from '@/components/ThemeStyle'
import Footer from '@/components/Footer'
import { baseUrl } from '@/lib/env'
import { ogImage, ogSite } from '@/lib/og/links'

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL(baseUrl()),
    title: { default: copy.siteName, template: `%s — ${copy.siteName}` },
    description: copy.ogDescription,
    openGraph: {
      type: 'website',
      siteName: copy.siteName,
      title: copy.ogTitle,
      description: copy.ogDescription,
      images: [ogImage(ogSite(), copy.og.alt.site())],
    },
    twitter: {
      card: 'summary_large_image',
      title: copy.ogTitle,
      description: copy.ogDescription,
      images: [ogImage(ogSite(), copy.og.alt.site())],
    },
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <ThemeStyle />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#110c12" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap"
        />
      </head>
      <body>
        <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-8 pt-[max(1rem,env(safe-area-inset-top))]">
          <header className="flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
              <span className="text-[1.35rem] leading-none" aria-hidden>
                {copy.logo}
              </span>
              {copy.siteName}
            </Link>
            <nav className="flex items-center text-sm" style={{ color: 'var(--l-muted)' }}>
              <Link href="/rules" className="flex h-11 items-center px-3 hover:text-[var(--l-ink)]">
                {copy.ui.navRules}
              </Link>
              <span aria-hidden>/</span>
              <Link href="/about" className="flex h-11 items-center px-3 hover:text-[var(--l-ink)]">
                {copy.ui.navAbout}
              </Link>
            </nav>
          </header>
          <main className="flex-1 pt-6 pb-28">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
