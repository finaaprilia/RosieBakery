'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
    { href: '/admin', label: 'Ringkasan' },
    { href: '/admin/produk', label: 'Produk' },
    { href: '/admin/pesanan', label: 'Pesanan' },
]

export default function AdminTabs() {
    const pathname = usePathname()
    return (
        <nav className="flex gap-5 border-b border-line">
            {TABS.map((t) => (
                <Link
                    key={t.href}
                    href={t.href}
                    className={`border-b-2 pb-2 font-bold ${pathname === t.href ? 'border-crust text-crust' : 'border-transparent text-ink/55'}`}
                >
                    {t.label}
                </Link>
            ))}
        </nav>
    )
}