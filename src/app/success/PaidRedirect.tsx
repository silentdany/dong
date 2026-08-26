'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/** Success page is a beat, not a destination: the board is where the rank is. */
export default function PaidRedirect({ href, label }: { href: string; label: string }) {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => router.replace(href), 1500)
    return () => clearTimeout(timer)
  }, [href, router])

  return (
    <Link href={href} className="mt-4 inline-block text-sm underline underline-offset-2" style={{ color: 'var(--l-accent)' }}>
      {label}
    </Link>
  )
}
