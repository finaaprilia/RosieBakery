'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { CATEGORIES } from '@/lib/constants'
import type { Product } from '@/lib/types'
import ProductCard from './ProductCard'

// Daftar menu + pencarian + filter kategori (sisi client)
export default function MenuBrowser({ products }: { products: Product[] }) {
    const [query, setQuery] = useState('')
    const [category, setCategory] = useState('Semua')

    const filtered = useMemo(
        () =>
            products.filter(
                (p) =>
                    (category === 'Semua' || p.category === category) &&
                    p.name.toLowerCase().includes(query.toLowerCase()),
            ),
        [products, query, category],
    )

    return (
        <div className="space-y-6">
            <div className="border-b border-line pb-3">
                <p className="hand text-lg text-crust">semua yang ada di etalase</p>
                <h1 className="text-4xl">Menu roti</h1>
            </div>

            <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama roti" className="input !pl-10" />
            </div>

            <div className="-mx-4 flex gap-5 overflow-x-auto border-b border-line px-4 md:mx-0 md:px-0">
                {['Semua', ...CATEGORIES].map((c) => (
                    <button
                        key={c}
                        onClick={() => setCategory(c)}
                        className={`shrink-0 border-b-2 pb-2 font-bold ${category === c ? 'border-crust text-crust' : 'border-transparent text-ink/55'}`}
                    >
                        {c}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="border-2 border-dashed border-line py-14 text-center" style={{ borderRadius: 4 }}>
                    <p className="text-lg">{products.length === 0 ? 'Menu masih kosong.' : 'Tidak ada roti yang cocok.'}</p>
                    <p className="text-sm text-ink/60">
                        {products.length === 0 ? 'Admin belum menambahkan menu.' : 'Coba kata kunci atau kategori lain.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-x-6 gap-y-10 pt-2 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((p, i) => (
                        <ProductCard key={p.id} product={p} index={i} />
                    ))}
                </div>
            )}
        </div>
    )
}