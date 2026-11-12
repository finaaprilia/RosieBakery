import { useState, useEffect, useCallback, useRef } from 'react'
import { seedProducts } from '../data/seed'
import productService from '../services/productService'
import * as syncService from '../services/syncService'

const STORAGE_KEY = 'rosie-bakery:products'

// ---------------------------------------------------------------------------
// Baca / tulis localStorage sebagai cache offline
// ---------------------------------------------------------------------------
function loadLocal() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) return JSON.parse(raw)
    } catch (err) {
        console.warn('Gagal membaca localStorage', err)
    }
    return seedProducts
}

function saveLocal(products) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
    } catch (err) {
        console.warn('Gagal menyimpan ke localStorage', err)
    }
}

// ---------------------------------------------------------------------------
// Custom hook CRUD produk — Offline-First Architecture
// ---------------------------------------------------------------------------
export function useProducts() {
    const [products, setProducts] = useState(loadLocal)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [syncStatus, setSyncStatus] = useState(() => (syncService.getQueue().length > 0 ? 'pending' : 'synced'))
    const [pendingCount, setPendingCount] = useState(() => syncService.getQueue().length)

    // Referensi untuk products terbaru agar aman dipanggil di callbacks
    const productsRef = useRef(products)
    useEffect(() => {
        productsRef.current = products
        saveLocal(products)
    }, [products])

    // Callback ketika produk baru yang dibuat offline berhasil terdaftar di server
    const handleProductCreated = useCallback((oldTempId, createdProduct) => {
        setProducts((prev) => {
            const updated = prev.map((p) => (String(p.id) === String(oldTempId) ? createdProduct : p))
            saveLocal(updated)
            return updated
        })
    }, [])

    // Fungsi sinkronisasi otomatis antrean
    const triggerSync = useCallback(async () => {
        if (!navigator.onLine) {
            const queueLen = syncService.getQueue().length
            setPendingCount(queueLen)
            setSyncStatus(queueLen > 0 ? 'pending' : 'synced')
            return
        }

        await syncService.processSyncQueue({
            onProductCreated: handleProductCreated,
            onStatusChange: (status, count) => {
                setSyncStatus(status)
                setPendingCount(count)
            },
        })
    }, [handleProductCreated])

    // Fetch awal dari Supabase
    useEffect(() => {
        let cancelled = false

        async function fetchFromSupabase() {
            const queue = syncService.getQueue()
            const hasPending = queue.length > 0

            // Jika ada antrean pending, prioritaskan sync terlebih dahulu
            if (hasPending && navigator.onLine) {
                await triggerSync()
            }

            try {
                setLoading(true)
                setError(null)
                const data = await productService.getProducts()
                if (!cancelled && Array.isArray(data) && data.length > 0) {
                    // Cek lagi apakah ada pending items lokal agar tidak tertimpa
                    const currentQueue = syncService.getQueue()
                    if (currentQueue.length === 0) {
                        setProducts(data)
                        saveLocal(data)
                        setSyncStatus('synced')
                        setPendingCount(0)
                    }
                }
            } catch (err) {
                console.warn('Supabase tidak tersedia, menggunakan data offline:', err.message)
                if (!cancelled) {
                    setProducts(loadLocal())
                    setError('Mode offline — data ditampilkan dari cache lokal.')
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        fetchFromSupabase()

        // Pemicu otomatis sinkronisasi saat internet kembali online
        const handleOnline = () => {
            triggerSync()
        }
        const handleOffline = () => {
            const count = syncService.getQueue().length
            setSyncStatus(count > 0 ? 'pending' : 'synced')
            setPendingCount(count)
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            cancelled = true
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [triggerSync])

    // ---- CREATE (Offline-First) ----
    const addProduct = useCallback(async (data) => {
        const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
        const optimistic = { ...data, id: tempId, favorite: false }

        // 1. Simpan instan di state & localStorage
        setProducts((prev) => [optimistic, ...prev])

        // 2. Masukkan ke antrean sinkronisasi
        const queue = syncService.addToQueue({
            type: 'CREATE',
            productId: tempId,
            payload: optimistic,
        })
        setPendingCount(queue.length)
        setSyncStatus(navigator.onLine ? 'syncing' : 'pending')

        // 3. Picu pengiriman jika online
        if (navigator.onLine) {
            triggerSync()
        }
    }, [triggerSync])

    // ---- UPDATE (Offline-First) ----
    const updateProduct = useCallback(async (id, data) => {
        // 1. Optimistic update di UI
        setProducts((prev) => prev.map((p) => (String(p.id) === String(id) ? { ...p, ...data } : p)))

        // 2. Masukkan ke antrean sinkronisasi
        const queue = syncService.addToQueue({
            type: 'UPDATE',
            productId: id,
            payload: data,
        })
        setPendingCount(queue.length)
        setSyncStatus(navigator.onLine ? 'syncing' : 'pending')

        // 3. Picu pengiriman jika online
        if (navigator.onLine) {
            triggerSync()
        }
    }, [triggerSync])

    // ---- DELETE (Offline-First) ----
    const deleteProduct = useCallback(async (id) => {
        // 1. Optimistic delete di UI
        setProducts((prev) => prev.filter((p) => String(p.id) !== String(id)))

        // 2. Masukkan ke antrean sinkronisasi
        const queue = syncService.addToQueue({
            type: 'DELETE',
            productId: id,
        })
        setPendingCount(queue.length)
        setSyncStatus(navigator.onLine ? 'syncing' : 'pending')

        // 3. Picu pengiriman jika online
        if (navigator.onLine) {
            triggerSync()
        }
    }, [triggerSync])

    // ---- TOGGLE FAVORITE (Offline-First & Idempotent) ----
    const toggleFavorite = useCallback(async (id) => {
        const currentItem = productsRef.current.find((p) => String(p.id) === String(id))
        if (!currentItem) return

        const nextStatus = !currentItem.favorite

        // 1. Optimistic update langsung di etalase
        setProducts((prev) =>
            prev.map((p) => (String(p.id) === String(id) ? { ...p, favorite: nextStatus } : p)),
        )

        // 2. Catat ke antrean sinkronisasi dengan nilai eksplisit
        const queue = syncService.addToQueue({
            type: 'SET_FAVORITE',
            productId: id,
            payload: { favorite: nextStatus },
        })
        setPendingCount(queue.length)
        setSyncStatus(navigator.onLine ? 'syncing' : 'pending')

        // 3. Picu pengiriman jika online
        if (navigator.onLine) {
            triggerSync()
        }
    }, [triggerSync])

    // ---- RESET: Refetch dari Supabase atau kembali ke seed ----
    const resetProducts = useCallback(async () => {
        try {
            const data = await productService.getProducts()
            if (Array.isArray(data) && data.length > 0) {
                setProducts(data)
                saveLocal(data)
                syncService.clearQueue()
                setPendingCount(0)
                setSyncStatus('synced')
                return
            }
        } catch {
            // fallback
        }
        setProducts(seedProducts)
        saveLocal(seedProducts)
        syncService.clearQueue()
        setPendingCount(0)
        setSyncStatus('synced')
    }, [])

    return {
        products,
        loading,
        error,
        syncStatus,
        pendingCount,
        triggerSync,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleFavorite,
        resetProducts,
        seedData: resetProducts,
    }
}
