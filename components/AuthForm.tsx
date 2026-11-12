'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react'
import { safeNext } from '@/lib/utils'

// Form login & register profesional (tampilan tersendiri)
export default function AuthForm({ mode, next }: { mode: 'login' | 'register'; next?: string }) {
    const router = useRouter()
    const isRegister = mode === 'register'
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
    const [showPassword, setShowPassword] = useState(false)
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
        try {
            const ch = new BroadcastChannel('rosie-auth-channel')
            ch.postMessage({ type: 'AUTH_CHANGED' })
            ch.close()
        } catch {}
        try {
            localStorage.setItem('rosie-auth-sync', Date.now().toString())
        } catch {}

        if (!next && data.role === 'admin') {
            router.push('/admin')
        } else {
            router.push(safeNext(next))
        }
        router.refresh() // muat ulang layout supaya Navbar & keranjang mengikuti user yang login
    }

    const suffix = next ? `?next=${encodeURIComponent(next)}` : ''

    return (
        <div className="flex min-h-[calc(100vh-8rem)] w-full flex-col items-center justify-center py-6 sm:py-10">
            <div className="w-full max-w-md">
                {/* Navigasi kembali ke beranda/toko */}
                <div className="mb-4 flex items-center justify-between px-1">
                    <Link
                        href={safeNext(next)}
                        className="inline-flex items-center gap-2 text-sm font-bold text-ink/65 transition hover:text-crust"
                    >
                        <ArrowLeft size={16} /> Kembali ke Toko
                    </Link>
                    <span className="hand text-sm text-ink/50">rosie bakery</span>
                </div>

                {/* Header branding */}
                <div className="mb-6 text-center">
                    <Link href="/" className="inline-block transition hover:opacity-95">
                        <span className="font-display text-4xl text-crust">Rosie Bakery</span>
                    </Link>
                    <p className="hand text-lg text-ink/65">dapur roti hangat dengan cinta</p>
                </div>

                {/* Card Auth Utama */}
                <div
                    className="overflow-hidden border-2 border-ink bg-flour shadow-[8px_8px_0_#d8b98a]"
                    style={{ borderRadius: 6 }}
                >
                    {/* Tab Switcher Masuk / Daftar */}
                    <div className="grid grid-cols-2 border-b-2 border-ink bg-paper/70 text-sm font-bold">
                        <Link
                            href={`/login${suffix}`}
                            className={`py-3.5 text-center transition ${
                                !isRegister
                                    ? 'border-b-2 border-crust bg-flour font-extrabold text-crust shadow-sm'
                                    : 'text-ink/55 hover:bg-flour/50 hover:text-ink'
                            }`}
                        >
                            Masuk
                        </Link>
                        <Link
                            href={`/register${suffix}`}
                            className={`py-3.5 text-center transition ${
                                isRegister
                                    ? 'border-b-2 border-crust bg-flour font-extrabold text-crust shadow-sm'
                                    : 'text-ink/55 hover:bg-flour/50 hover:text-ink'
                            }`}
                        >
                            Daftar
                        </Link>
                    </div>

                    {/* Konten Form */}
                    <div className="p-6 sm:p-8">
                        <div className="mb-6">
                            <h2 className="font-display text-2xl text-ink">
                                {isRegister ? 'Buat Akun Baru' : 'Masuk ke Akun'}
                            </h2>
                            <p className="mt-1 text-sm text-ink/65">
                                {isRegister
                                    ? 'Daftar untuk memesan dan memantau status pesanan roti kamu.'
                                    : 'Senang bertemu lagi! Masuk untuk memesan roti favoritmu.'}
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                            {isRegister && (
                                <label className="block">
                                    <span className="label">Nama Lengkap</span>
                                    <div className="relative">
                                        <User
                                            size={18}
                                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40"
                                        />
                                        <input
                                            className="input !pl-10"
                                            value={form.name}
                                            onChange={set('name')}
                                            placeholder="mis. Rosita"
                                            required
                                        />
                                    </div>
                                </label>
                            )}

                            <label className="block">
                                <span className="label">Alamat Email</span>
                                <div className="relative">
                                    <Mail
                                        size={18}
                                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40"
                                    />
                                    <input
                                        type="email"
                                        className="input !pl-10"
                                        value={form.email}
                                        onChange={set('email')}
                                        placeholder="kamu@email.com"
                                        required
                                    />
                                </div>
                            </label>

                            {isRegister && (
                                <label className="block">
                                    <span className="label">Nomor WhatsApp / HP (opsional)</span>
                                    <div className="relative">
                                        <Phone
                                            size={18}
                                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40"
                                        />
                                        <input
                                            type="tel"
                                            inputMode="tel"
                                            className="input !pl-10"
                                            value={form.phone}
                                            onChange={set('phone')}
                                            placeholder="08xxxxxxxxxx"
                                        />
                                    </div>
                                </label>
                            )}

                            <label className="block">
                                <span className="label">Password</span>
                                <div className="relative">
                                    <Lock
                                        size={18}
                                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40"
                                    />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="input !pl-10 !pr-10"
                                        value={form.password}
                                        onChange={set('password')}
                                        placeholder={isRegister ? 'Minimal 8 karakter' : 'Masukkan password'}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/45 transition hover:text-ink"
                                        aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </label>

                            {error && (
                                <div className="border-l-4 border-brick bg-paper px-3.5 py-2.5 text-sm text-brick">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={busy}
                                className="btn btn-primary w-full !py-3.5 text-base shadow-[4px_4px_0_#2a1c13]"
                            >
                                {busy ? 'Memproses...' : isRegister ? 'Daftar Sekarang' : 'Masuk ke Akun'}
                            </button>
                        </form>

                        {/* Switch link di bagian bawah card */}
                        <div className="mt-6 border-t border-line/60 pt-4 text-center text-sm text-ink/70">
                            {isRegister ? (
                                <p>
                                    Sudah punya akun?{' '}
                                    <Link
                                        href={`/login${suffix}`}
                                        className="font-bold text-crust underline underline-offset-4 hover:text-crust-dark"
                                    >
                                        Masuk di sini
                                    </Link>
                                </p>
                            ) : (
                                <p>
                                    Belum punya akun?{' '}
                                    <Link
                                        href={`/register${suffix}`}
                                        className="font-bold text-crust underline underline-offset-4 hover:text-crust-dark"
                                    >
                                        Daftar sekarang
                                    </Link>
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer kecil */}
                <p className="mt-4 text-center text-xs text-ink/50">
                    &copy; Rosie Bakery &bull; Autentikasi Aman & Nyaman
                </p>
            </div>
        </div>
    )
}
