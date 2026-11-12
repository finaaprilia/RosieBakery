import { Home, UtensilsCrossed, Heart, ShoppingBasket, User } from 'lucide-react'

const NAV_ITEMS = [
    { id: 'home', label: 'Beranda', icon: Home },
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
    { id: 'favorites', label: 'Favorit', icon: Heart },
    { id: 'cart', label: 'Keranjang', icon: ShoppingBasket },
    { id: 'profile', label: 'Profil', icon: User },
]

function CartBadge({ count }) {
    if (!count) return null
    return (
        <span key={count} className="bump absolute -right-2.5 -top-2 flex h-[18px] min-w-[18px] items-center justify-center bg-crust px-1 text-[11px] font-bold leading-none text-white" style={{ borderRadius: 3 }}>
            {count}
        </span>
    )
}

export default function Navbar({ page, onNavigate, cartCount }) {
    const active = (id) => page === id || (page === 'detail' && id === 'menu')

    return (
        <>
            {/* Desktop */}
            <header className="hidden border-b border-line md:block">
                <div className="mx-auto flex max-w-6xl items-baseline justify-between px-6 pb-3 pt-5">
                    <button onClick={() => onNavigate('home')} className="flex items-baseline gap-3 text-left">
                        <span className="font-display text-2xl text-crust">Rosie Bakery</span>
                    </button>
                    <nav className="flex gap-7">
                        {NAV_ITEMS.map(({ id, label }) => (
                            <button
                                key={id}
                                onClick={() => onNavigate(id)}
                                className={`relative border-b-2 pb-1 font-bold transition ${active(id) ? 'border-crust text-crust' : 'border-transparent text-ink/60 hover:text-ink'
                                    }`}
                            >
                                {label}
                                {id === 'cart' && <CartBadge count={cartCount} />}
                            </button>
                        ))}
                    </nav>
                </div>
            </header>

            {/* Mobile: judul + navigasi bawah */}
            <header className="flex items-center justify-center border-b border-line px-4 py-3 md:hidden">
                <span className="font-display text-xl text-crust">Rosie Bakery</span>
            </header>
            <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)] md:hidden">
                <div className="grid grid-cols-5">
                    {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => onNavigate(id)}
                            className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold ${active(id) ? 'bg-flour text-crust' : 'text-ink/55'
                                }`}
                        >
                            <span className="relative">
                                <Icon size={20} strokeWidth={active(id) ? 2.4 : 1.8} />
                                {id === 'cart' && <CartBadge count={cartCount} />}
                            </span>
                            {label}
                        </button>
                    ))}
                </div>
            </nav>
        </>
    )
}