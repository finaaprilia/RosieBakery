'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Minus, Plus, ShoppingBasket } from 'lucide-react'
import type { Product } from '@/lib/types'
import { useCart } from './CartProvider'

// Pilih jumlah + tombol "Masukkan keranjang" di halaman detail produk
export default function ProductActions({ product }: { product: Product }) {
    const { addToCart, qtyOf } = useCart()
    const [qty, setQty] = useState(1)
    const [added, setAdded] = useState(false)

    const inCart = qtyOf(product.id)
    const maxAdd = Math.max(product.stock - inCart, 0)
    const soldOut = product.stock <= 0

    const handleAdd = async () => {
        const ok = await addToCart(product, Math.min(qty, maxAdd))
        if (!ok) return
        setAdded(true)
        setQty(1)
        setTimeout(() => setAdded(false), 1800)
    }

    return (
        <>
            {!soldOut && (
                <div className="mt-6 flex flex-wrap items-center gap-4">
                    <div className="inline-flex items-center border-[1.5px] border-ink bg-flour" style={{ borderRadius: 4 }}>
                        <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Kurangi" className="p-3 hover:bg-paper"><Minus size={16} /></button>
                        <span className="w-10 text-center text-lg font-bold">{maxAdd === 0 ? 0 : Math.min(qty, maxAdd)}</span>
                        <button onClick={() => setQty((q) => Math.min(maxAdd, q + 1))} aria-label="Tambah" className="p-3 hover:bg-paper"><Plus size={16} /></button>
                    </div>
                    <button onClick={handleAdd} disabled={maxAdd === 0} className="btn btn-primary">
                        <ShoppingBasket size={18} /> {maxAdd === 0 ? 'Sudah maksimal di keranjang' : 'Masukkan keranjang'}
                    </button>
                </div>
            )}

            {inCart > 0 && (
                <p className="mt-4 text-sm">
                    {added ? 'Sudah masuk keranjang. ' : ''}Di keranjang: <b>{inCart}</b>.{' '}
                    <Link href="/keranjang" className="font-bold text-crust underline underline-offset-4">Lihat keranjang</Link>
                </p>
            )}
        </>
    )
}