import { copy } from '@config/copy'

export default function Footer() {
  return (
    <footer className="mt-10 border-t pt-4 text-xs" style={{ borderColor: 'var(--l-track)', color: 'var(--l-muted)' }}>
      <p>{copy.footer}</p>
    </footer>
  )
}
