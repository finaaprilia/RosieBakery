'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
    const router = useRouter()
    const [busy, setBusy] = useState(false)

    const logout = async () => {
        setBusy(true)
        await fetch('/api/auth/logout', { method: 'POST' })
        router.replace('/')
        router.refresh()
    }

    return (
        <button onClick={logout} disabled={busy} className="btn btn-ghost">
            <LogOut size={16} /> {busy ? 'Keluar...' : 'Keluar'}
        </button>
    )
}