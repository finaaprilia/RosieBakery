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
        try {
            const ch = new BroadcastChannel('rosie-auth-channel')
            ch.postMessage({ type: 'AUTH_CHANGED' })
            ch.close()
        } catch {}
        try {
            localStorage.setItem('rosie-auth-sync', Date.now().toString())
        } catch {}
        router.replace('/')
        router.refresh()
    }

    return (
        <button onClick={logout} disabled={busy} className="btn btn-ghost">
            <LogOut size={16} /> {busy ? 'Keluar...' : 'Keluar'}
        </button>
    )
}
