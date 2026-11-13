'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Home,
    UtensilsCrossed,
    ShoppingBasket,
    User,
    LogIn,
    type LucideIcon,
} from 'lucide-react'
import { useCart } from './CartProvider'

type NavItem = { href: string; label: string; icon: LucideIcon; badge?: boolean }

function CartBadge({ count }: { count: number }) {
    if (!count) return null
    return (
        <span
            key={count}
            className="bump absolute -right-2.5 -top-2 flex h-[18px] min-w-[18px] items-center justify-center bg-crust px-1 text-[11px] font-bold leading-none text-white"
            style={{ borderRadius: 3 }}
        >
            {count}
        </span>
    )
}

export default function Navbar() {
    const pathname = usePathname()
    const { user, count } = useCart()

    // Halaman login dan register memiliki tampilan tersendiri
    if (pathname === '/login' || pathname === '/register') return null

    // Pastikan jika di panel admin atau role admin, navigasi toko tidak pernah tampil
    const isAdmin = user?.role === 'admin' || pathname.startsWith('/admin')

    const items: NavItem[] = isAdmin
        ? [
            { href: '/profile', label: 'Profil', icon: User },
        ]
        : [
            { href: '/', label: 'Beranda', icon: Home },
            { href: '/menu', label: 'Menu', icon: UtensilsCrossed },
            { href: '/keranjang', label: 'Keranjang', icon: ShoppingBasket, badge: true },
            user ? { href: '/profile', label: 'Profil', icon: User } : { href: '/login', label: 'Masuk', icon: LogIn },
        ]

    const active = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))

    return (
        <>
            {/* Desktop */}
            <header className="hidden border-b border-line md:block">
                <div className="mx-auto flex max-w-6xl items-baseline justify-between px-6 pb-3 pt-5">
                    <Link href={isAdmin ? '/admin' : '/'} className="flex items-baseline gap-3 text-left">
                        <span className="font-display text-2xl text-crust">Rosie Bakery</span>
                    </Link>
                    <nav className="flex gap-7">
                        {items.map(({ href, label, badge }) => (
                            <Link
                                key={href}
                                href={href}
                                className={`relative border-b-2 pb-1 font-bold transition ${active(href) ? 'border-crust text-crust' : 'border-transparent text-ink/60 hover:text-ink'
                                    }`}
                            >
                                {label}
                                {badge && <CartBadge count={count} />}
                            </Link>
                        ))}
                    </nav>
                </div>
            </header>

            {/* Mobile: judul + navigasi */}
            <header className={`flex items-center ${isAdmin ? 'justify-between' : 'justify-center'} border-b border-line px-4 py-3 md:hidden`}>
                <Link href={isAdmin ? '/admin' : '/'}>
                    <span className="font-display text-xl text-crust">Rosie Bakery</span>
                </Link>
                {isAdmin && (
                    <Link
                        href="/profile"
                        aria-label="Profil"
                        title="Profil"
                        className={`flex items-center justify-center p-1.5 transition ${active('/profile') ? 'text-crust' : 'text-ink/60 hover:text-ink'
                            }`}
                    >
                        <User size={20} strokeWidth={active('/profile') ? 2.4 : 1.8} />
                    </Link>
                )}
            </header>

            {!isAdmin && (
                <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)] md:hidden">
                    <div className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
                        {items.map(({ href, label, icon: Icon, badge }) => (
                            <Link
                                key={href}
                                href={href}
                                className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold ${active(href) ? 'bg-flour text-crust' : 'text-ink/55'
                                    }`}
                            >
                                <span className="relative">
                                    <Icon size={20} strokeWidth={active(href) ? 2.4 : 1.8} />
                                    {badge && <CartBadge count={count} />}
                                </span>
                                {label}
                            </Link>
                        ))}
                    </div>
                </nav>
            )}
        </>
    )
}
