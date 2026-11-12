'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { safeNext } from '@/lib/utils'

// Form login & register (dipakai oleh app/login dan app/register)
export default function AuthForm({ mode, next }: { mode: 'login' | 'register'; next?: string }) {
    const router = useRouter()
    const isRegister = mode === 'register'
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)

    const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value }))

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setBusy(true)
        const res = await fetch(`/api/auth/${mode}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
            setError(data.error || 'Terjadi kesalahan, coba lagi')
            setBusy(false)
            return
        }
        router.push(safeNext(next))
        router.refresh() // muat ulang layout supaya Navbar & keranjang mengikuti user yang login
    }

    const suffix = next ? `?next=${encodeURIComponent(next)}` : ''

    return (
        <div className="mx-auto max-w-md py-6">
            <p className="hand text-lg text-crust">{isRegister ? 'selamat datang' : 'senang bertemu lagi'}</p>
            <h1 className="text-4xl">{isRegister ? 'Buat akun' : 'Masuk'}</h1>
            <p className="mt-1 text-ink/65">Untuk memesan roti, kamu perlu masuk terlebih dahulu.</p>

            <form onSubmit={submit} className="mt-6 space-y-4 border-2 border-ink bg-flour p-5 shadow-[6px_6px_0_#d8b98a]" style={{ borderRadius: 4 }}>
                {isRegister && (
                    <label className="block">
                        <span className="label">Nama</span>
                        <input className="input" value={form.name} onChange={set('name')} placeholder="mis. Rosita" required />
                    </label>
                )}
                <label className="block">
                    <span className="label">Email</span>
                    <input type="email" className="input" value={form.email} onChange={set('email')} placeholder="kamu@email.com" required />
                </label>
                {isRegister && (
                    <label className="block">
                        <span className="label">No. HP (opsional)</span>
                        <input className="input" inputMode="tel" value={form.phone} onChange={set('phone')} placeholder="08xxxxxxxxxx" />
                    </label>
                )}
                <label className="block">
                    <span className="label">Password</span>
                    <input type="password" className="input" value={form.password} onChange={set('password')} placeholder={isRegister ? 'Minimal 8 karakter' : ''} required />
                </label>

                {error && <p className="border-l-4 border-brick bg-paper px-3 py-2 text-sm text-brick">{error}</p>}

                <button type="submit" disabled={busy} className="btn btn-primary w-full !py-3">
                    {busy ? 'Memproses...' : isRegister ? 'Daftar' : 'Masuk'}
                </button>
            </form>

            <p className="mt-4 text-center text-sm text-ink/70">
                {isRegister ? 'Sudah punya akun? ' : 'Belum punya akun? '}
                <Link href={`${isRegister ? '/login' : '/register'}${suffix}`} className="font-bold text-crust underline underline-offset-4">
                    {isRegister ? 'Masuk' : 'Daftar'}
                </Link>
            </p>
        </div>
    )
}