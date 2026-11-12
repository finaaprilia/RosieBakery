'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import type { CartLine, Product, SessionUser } from '@/lib/types'

const CART_KEY = 'rosie-bakery:cart'

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
    syncToDatabase: () => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

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
    const [currentUser, setCurrentUser] = useState<SessionUser | null>(user)
    const [lines, setLines] = useState<CartLine[]>(initialLines)

    // Perbarui currentUser saat prop user dari server berubah
    useEffect(() => {
        setCurrentUser(user)
    }, [user])

    // Sinkronisasi status autentikasi antar tab
    useEffect(() => {
        let channel: BroadcastChannel | null = null
        try {
            channel = new BroadcastChannel('rosie-auth-channel')
            channel.onmessage = async (e) => {
                if (e.data?.type === 'AUTH_CHANGED') {
                    const res = await fetch('/api/auth/me')
                    const data = await res.json().catch(() => null)
                    if (data) {
                        setCurrentUser(data.user)
                        router.refresh()
                    }
                }
            }
        } catch {}

        const handleStorage = async (e: StorageEvent) => {
            if (e.key === 'rosie-auth-sync') {
                const res = await fetch('/api/auth/me')
                const data = await res.json().catch(() => null)
                if (data) {
                    setCurrentUser(data.user)
                    router.refresh()
                }
            }
        }

        const handleFocus = async () => {
            try {
                const res = await fetch('/api/auth/me')
                const data = await res.json().catch(() => null)
                if (data && data.user?.role !== currentUser?.role) {
                    setCurrentUser(data.user)
                    router.refresh()
                }
            } catch {}
        }

        window.addEventListener('storage', handleStorage)
        window.addEventListener('focus', handleFocus)

        return () => {
            channel?.close()
            window.removeEventListener('storage', handleStorage)
            window.removeEventListener('focus', handleFocus)
        }
    }, [currentUser, router])

    // Simpan ke localStorage
    const saveToLocal = useCallback((items: CartLine[]) => {
        try {
            localStorage.setItem(CART_KEY, JSON.stringify(items))
        } catch (e) {
            console.warn('Gagal menyimpan keranjang ke localStorage', e)
        }
    }, [])

    // Muat dari localStorage saat client mount
    useEffect(() => {
        try {
            const raw = localStorage.getItem(CART_KEY)
            const localItems: CartLine[] = raw ? JSON.parse(raw) : []
            if (Array.isArray(localItems) && localItems.length > 0) {
                if (initialLines.length === 0) {
                    setLines(localItems)
                    if (currentUser) {
                        localItems.forEach((l) => {
                            fetch('/api/cart', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ productId: l.product.id, qty: l.qty }),
                            }).catch(() => {})
                        })
                    }
                } else {
                    // Gabungkan item dari database dan local
                    const map = new Map<number, CartLine>()
                    initialLines.forEach((l) => map.set(l.product.id, { ...l }))
                    localItems.forEach((l) => {
                        const existing = map.get(l.product.id)
                        if (existing) {
                            existing.qty = Math.max(existing.qty, l.qty)
                        } else {
                            map.set(l.product.id, { ...l })
                        }
                    })
                    const merged = Array.from(map.values())
                    setLines(merged)
                    saveToLocal(merged)
                }
            } else if (initialLines.length > 0) {
                saveToLocal(initialLines)
            }
        } catch (e) {
            console.warn('Gagal membaca keranjang dari localStorage', e)
        }
    }, [initialLines, currentUser, saveToLocal])

    const syncToDatabase = useCallback(async () => {
        if (!currentUser) return
        try {
            await fetch('/api/cart', { method: 'DELETE' })
            for (const item of lines) {
                await fetch('/api/cart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId: item.product.id, qty: item.qty }),
                })
            }
        } catch (e) {
            console.warn('Gagal sinkronisasi keranjang ke database', e)
        }
    }, [currentUser, lines])

    const addToCart = useCallback(
        async (product: Product, qty = 1): Promise<boolean> => {
            if (product.stock <= 0) return false

            setLines((prev) => {
                const found = prev.find((l) => l.product.id === product.id)
                const nextQty = Math.min((found?.qty || 0) + qty, product.stock)
                const next = found
                    ? prev.map((l) => (l.product.id === product.id ? { ...l, qty: nextQty } : l))
                    : [...prev, { product, qty: nextQty }]
                saveToLocal(next)
                return next
            })

            if (currentUser) {
                fetch('/api/cart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId: product.id, qty }),
                }).catch(() => {})
            }

            return true
        },
        [currentUser, saveToLocal],
    )

    const setQty = useCallback(
        async (productId: number, qty: number) => {
            setLines((prev) => {
                const target = prev.find((l) => l.product.id === productId)
                let next: CartLine[]
                if (qty <= 0) {
                    next = prev.filter((l) => l.product.id !== productId)
                } else if (target) {
                    const validQty = Math.min(qty, target.product.stock)
                    next = prev.map((l) => (l.product.id === productId ? { ...l, qty: validQty } : l))
                } else {
                    next = prev
                }
                saveToLocal(next)
                return next
            })

            if (currentUser) {
                fetch('/api/cart', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId, qty }),
                }).catch(() => {})
            }
        },
        [currentUser, saveToLocal],
    )

    const removeFromCart = useCallback(
        async (productId: number) => {
            setLines((prev) => {
                const next = prev.filter((l) => l.product.id !== productId)
                saveToLocal(next)
                return next
            })

            if (currentUser) {
                fetch(`/api/cart?productId=${productId}`, { method: 'DELETE' }).catch(() => {})
            }
        },
        [currentUser, saveToLocal],
    )

    const clearCart = useCallback(async () => {
        setLines([])
        try {
            localStorage.removeItem(CART_KEY)
        } catch {}

        if (currentUser) {
            fetch('/api/cart', { method: 'DELETE' }).catch(() => {})
        }
    }, [currentUser])

    const refresh = useCallback(async () => {
        if (!currentUser) return
        try {
            const res = await fetch('/api/cart')
            const data = await res.json().catch(() => null)
            if (data?.lines) {
                setLines(data.lines)
                saveToLocal(data.lines)
            }
        } catch (e) {
            console.warn('Gagal memperbarui keranjang dari server', e)
        }
    }, [currentUser, saveToLocal])

    const value = useMemo<CartContextValue>(
        () => ({
            user: currentUser,
            lines,
            count: lines.reduce((sum, l) => sum + l.qty, 0),
            total: lines.reduce((sum, l) => sum + l.qty * l.product.price, 0),
            qtyOf: (id) => lines.find((l) => l.product.id === id)?.qty ?? 0,
            addToCart,
            setQty,
            removeFromCart,
            clearCart,
            refresh,
            syncToDatabase,
        }),
        [currentUser, lines, addToCart, setQty, removeFromCart, clearCart, refresh, syncToDatabase],
    )

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
    const ctx = useContext(CartContext)
    if (!ctx) throw new Error('useCart harus dipakai di dalam <CartProvider>')
    return ctx
}
