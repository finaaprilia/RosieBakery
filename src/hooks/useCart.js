import { useState, useEffect, useCallback, useMemo } from 'react'

const CART_KEY = 'rosie-bakery:cart'

const readCart = () => {
    try {
        const parsed = JSON.parse(localStorage.getItem(CART_KEY))
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

// Keranjang belanja. Hanya menyimpan { id, qty } di localStorage;
// nama, harga, dan foto selalu diambil dari data produk terbaru.
export function useCart(products) {
    const [items, setItems] = useState(readCart)

    useEffect(() => {
        try {
            localStorage.setItem(CART_KEY, JSON.stringify(items))
        } catch (err) {
            console.warn('Gagal menyimpan keranjang', err)
        }
    }, [items])

    // Gabungkan item keranjang dengan data produk (produk yang sudah dihapus diabaikan)
    const lines = useMemo(
        () =>
            items
                .map((it) => {
                    const product = products.find((p) => p.id === it.id)
                    return product ? { product, qty: Math.min(it.qty, Math.max(product.stock, 1)) } : null
                })
                .filter(Boolean),
        [items, products],
    )

    const count = lines.reduce((sum, l) => sum + l.qty, 0)
    const total = lines.reduce((sum, l) => sum + l.qty * l.product.price, 0)

    const qtyOf = useCallback((id) => items.find((i) => i.id === id)?.qty || 0, [items])

    const addToCart = useCallback(
        (product, qty = 1) => {
            if (product.stock <= 0) return false
            setItems((prev) => {
                const found = prev.find((i) => i.id === product.id)
                const nextQty = Math.min((found?.qty || 0) + qty, product.stock)
                return found
                    ? prev.map((i) => (i.id === product.id ? { ...i, qty: nextQty } : i))
                    : [...prev, { id: product.id, qty: nextQty }]
            })
            return true
        },
        [],
    )

    const setQty = useCallback((id, qty) => {
        setItems((prev) =>
            qty <= 0 ? prev.filter((i) => i.id !== id) : prev.map((i) => (i.id === id ? { ...i, qty } : i)),
        )
    }, [])

    const removeFromCart = useCallback((id) => setItems((prev) => prev.filter((i) => i.id !== id)), [])
    const clearCart = useCallback(() => setItems([]), [])

    return { lines, count, total, qtyOf, addToCart, setQty, removeFromCart, clearCart }
}