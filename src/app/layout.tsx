import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'
import { copy } from '@config/copy'
import ThemeStyle from '@/components/ThemeStyle'
import Footer from '@/components/Footer'
import { baseUrl } from '@/lib/env'

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL(baseUrl()),
    title: { default: copy.ogTitle, template: `%s — ${copy.siteName}` },
    description: copy.description,
    openGraph: {
      type: 'website',
      siteName: copy.siteName,
      title: copy.ogTitle,
      description: copy.ogDescription,
      images: ['/og'],
    },
    twitter: { card: 'summary_large_image', title: copy.ogTitle, description: copy.ogDescription, images: ['/og'] },
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <ThemeStyle />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body>
        <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-3 py-6 sm:px-4 sm:py-8">
          <header className="mb-5 sm:mb-6">
            <Link href="/" className="text-sm font-bold tracking-tight">
              {copy.siteName}
            </Link>
          </header>
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
