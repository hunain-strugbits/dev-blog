'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  const handleLogout = async () => {
    setPending(true)

    try {
      await fetch('/api/users/logout', { method: 'POST' })
    } finally {
      setPending(false)
      router.push('/')
      router.refresh()
    }
  }

  return (
    <button type="button" className="site-logout" onClick={handleLogout} disabled={pending}>
      {pending ? 'Logging out…' : 'Log out'}
    </button>
  )
}
