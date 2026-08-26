import Link from 'next/link'
import { copy } from '@config/copy'

export default function Footer() {
  return (
    <footer className="mt-16 border-t pt-6 text-xs" style={{ borderColor: 'var(--l-track)', color: 'var(--l-muted)' }}>
      <nav className="mb-2 flex gap-4">
        <Link href="/rules" className="underline underline-offset-2">
          {copy.ui.navRules}
        </Link>
        <Link href="/about" className="underline underline-offset-2">
          {copy.ui.navAbout}
        </Link>
      </nav>
      <p>{copy.footer}</p>
    </footer>
  )
}
