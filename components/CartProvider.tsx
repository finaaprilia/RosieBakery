'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { CartLine, Product, SessionUser } from '@/lib/types'

type CartContextValue = {
    user: SessionUser | null
    lines: CartLine[]
    count: number
    total: number
    qtyOf: (productId: number) => number
    addToCart: (product: Product, qty?: number) => Promise<boolean>
    setQty: (productId: number, qty: number) => Promise<void>
    removeFromCart: (productId: number) => Promise<void>
    clearCart: () => Promise<void>
    refresh: () => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

// Keranjang tersimpan di database (per user). Komponen ini hanya menyimpan salinannya untuk tampilan.
export default function CartProvider({
    user,
    initialLines,
    children,
}: {
    user: SessionUser | null
    initialLines: CartLine[]
    children: ReactNode
}) {
    const router = useRouter()
    const pathname = usePathname()
    const [lines, setLines] = useState<CartLine[]>(initialLines)

    const goLogin = useCallback(() => {
        router.push(`/login?next=${encodeURIComponent(pathname)}`)
    }, [router, pathname])

    // Panggil API keranjang; API selalu mengembalikan isi keranjang terbaru
    const request = useCallback(
        async (method: string, url = '/api/cart', body?: object) => {
            if (!user) {
                goLogin()
                return false
            }
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: body ? JSON.stringify(body) : undefined,
            })
            if (res.status === 401) {
                goLogin()
                return false
            }
            const data = await res.json().catch(() => null)
            if (data?.lines) setLines(data.lines)
            return res.ok
        },
        [user, goLogin],
    )

    const value = useMemo<CartContextValue>(
        () => ({
            user,
            lines,
            count: lines.reduce((sum, l) => sum + l.qty, 0),
            total: lines.reduce((sum, l) => sum + l.qty * l.product.price, 0),
            qtyOf: (id) => lines.find((l) => l.product.id === id)?.qty ?? 0,
            addToCart: (product, qty = 1) =>
                product.stock <= 0 ? Promise.resolve(false) : request('POST', '/api/cart', { productId: product.id, qty }),
            setQty: async (productId, qty) => {
                await request('PATCH', '/api/cart', { productId, qty })
            },
            removeFromCart: async (productId) => {
                await request('DELETE', `/api/cart?productId=${productId}`)
            },
            clearCart: async () => {
                await request('DELETE', '/api/cart')
            },
            refresh: async () => {
                await request('GET', '/api/cart')
            },
        }),
        [user, lines, request],
    )

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
    const ctx = useContext(CartContext)
    if (!ctx) throw new Error('useCart harus dipakai di dalam <CartProvider>')
    return ctx
}