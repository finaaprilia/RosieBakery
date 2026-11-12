import productService from './productService'

const SYNC_QUEUE_KEY = 'rosie-bakery:sync-queue'

// ---------------------------------------------------------------------------
// Helpers localStorage untuk Antrean Sinkronisasi (Sync Queue)
// ---------------------------------------------------------------------------
export function getQueue() {
    try {
        const raw = localStorage.getItem(SYNC_QUEUE_KEY)
        if (raw) return JSON.parse(raw)
    } catch (err) {
        console.warn('[syncService] Gagal membaca antrean:', err)
    }
    return []
}

export function saveQueue(queue) {
    try {
        localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue))
    } catch (err) {
        console.warn('[syncService] Gagal menyimpan antrean:', err)
    }
}

// Migrasi data `pendingFavorites` lama jika ada di localStorage
function migrateOldFavorites() {
    try {
        const raw = localStorage.getItem('pendingFavorites')
        if (raw) {
            const ids = JSON.parse(raw)
            if (Array.isArray(ids) && ids.length > 0) {
                const queue = getQueue()
                for (const id of ids) {
                    queue.push({
                        id: `sync_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                        type: 'SET_FAVORITE',
                        productId: String(id),
                        payload: { favorite: true },
                        createdAt: Date.now(),
                    })
                }
                saveQueue(queue)
            }
            localStorage.removeItem('pendingFavorites')
        }
    } catch {
        // Abaikan jika tidak ada atau format rusak
    }
}

migrateOldFavorites()

// ---------------------------------------------------------------------------
// Menambahkan Aksi ke Antrean Sinkronisasi secara Pintar & Idempoten
// ---------------------------------------------------------------------------
export function addToQueue(action) {
    const queue = getQueue()
    const item = {
        id: `sync_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        type: action.type, // 'CREATE' | 'UPDATE' | 'DELETE' | 'SET_FAVORITE'
        productId: String(action.productId),
        payload: action.payload || {},
        createdAt: Date.now(),
    }

    // Penanganan cerdas:
    if (item.type === 'DELETE') {
        const isOfflineCreated = String(item.productId).startsWith('temp_')
        if (isOfflineCreated) {
            // Jika produk baru dibuat offline dan belum disinkronkan, batalkan CREATE dan hapus dari antrean
            const filtered = queue.filter((q) => String(q.productId) !== String(item.productId))
            saveQueue(filtered)
            return filtered
        } else {
            // Hapus update atau favorite sebelumnya untuk produk ini, lalu tambahkan DELETE
            const filtered = queue.filter((q) => String(q.productId) !== String(item.productId))
            filtered.push(item)
            saveQueue(filtered)
            return filtered
        }
    }

    if (item.type === 'UPDATE') {
        // Jika ada CREATE pending untuk item ini, gabungkan payload langsung ke CREATE
        const pendingCreate = queue.find((q) => q.type === 'CREATE' && String(q.productId) === String(item.productId))
        if (pendingCreate) {
            pendingCreate.payload = { ...pendingCreate.payload, ...item.payload }
            saveQueue(queue)
            return queue
        }

        // Jika ada UPDATE pending sebelumnya, gabungkan payload
        const pendingUpdate = queue.find((q) => q.type === 'UPDATE' && String(q.productId) === String(item.productId))
        if (pendingUpdate) {
            pendingUpdate.payload = { ...pendingUpdate.payload, ...item.payload }
            saveQueue(queue)
            return queue
        }
    }

    if (item.type === 'SET_FAVORITE') {
        // Jika ada CREATE pending, update status favorit langsung di CREATE
        const pendingCreate = queue.find((q) => q.type === 'CREATE' && String(q.productId) === String(item.productId))
        if (pendingCreate) {
            pendingCreate.payload = { ...pendingCreate.payload, favorite: item.payload.favorite }
            saveQueue(queue)
            return queue
        }

        // Jika ada SET_FAVORITE pending sebelumnya untuk produk ini, perbarui statusnya
        const pendingFav = queue.find((q) => q.type === 'SET_FAVORITE' && String(q.productId) === String(item.productId))
        if (pendingFav) {
            pendingFav.payload = { favorite: item.payload.favorite }
            saveQueue(queue)
            return queue
        }
    }

    queue.push(item)
    saveQueue(queue)
    return queue
}

export function removeFromQueue(queueId) {
    const queue = getQueue().filter((q) => q.id !== queueId)
    saveQueue(queue)
    return queue
}

export function clearQueue() {
    saveQueue([])
}

// ---------------------------------------------------------------------------
// Pemrosesan Antrean Sinkronisasi (Sync Dispatcher)
// ---------------------------------------------------------------------------
let isSyncing = false

export async function processSyncQueue({ onProductCreated, onStatusChange }) {
    if (isSyncing) return
    if (!navigator.onLine) {
        const queue = getQueue()
        if (onStatusChange) onStatusChange(queue.length > 0 ? 'pending' : 'synced', queue.length)
        return
    }

    let queue = getQueue()
    if (queue.length === 0) {
        if (onStatusChange) onStatusChange('synced', 0)
        return
    }

    isSyncing = true
    if (onStatusChange) onStatusChange('syncing', queue.length)

    try {
        while (queue.length > 0) {
            if (!navigator.onLine) {
                // Koneksi terputus di tengah pemrosesan
                if (onStatusChange) onStatusChange('pending', queue.length)
                break
            }

            const current = queue[0]

            try {
                if (current.type === 'CREATE') {
                    // Pastikan id temp tidak dikirim ke Supabase
                    const payload = { ...current.payload }
                    delete payload.id
                    const created = await productService.createProduct(payload)

                    if (created && created.id) {
                        const oldId = current.productId
                        const newId = created.id

                        // Beritahukan UI untuk memperbarui temp ID ke ID server asli
                        if (onProductCreated) {
                            onProductCreated(oldId, created)
                        }

                        // Perbarui referensi ID di sisa antrean jika ada mutasi lanjutan
                        queue = queue.map((q) => (String(q.productId) === String(oldId) ? { ...q, productId: String(newId) } : q))
                    }
                } else if (current.type === 'UPDATE') {
                    await productService.updateProduct(current.productId, current.payload)
                } else if (current.type === 'DELETE') {
                    await productService.deleteProduct(current.productId)
                } else if (current.type === 'SET_FAVORITE') {
                    await productService.toggleFavorite(current.productId, current.payload.favorite)
                }

                // Sukses: hapus item teratas dari antrean
                queue.shift()
                saveQueue(queue)
                if (onStatusChange) onStatusChange(queue.length > 0 ? 'syncing' : 'synced', queue.length)
            } catch (err) {
                const isNetworkErr = !err.status || err.message?.includes('koneksi') || err.message?.includes('Network') || !navigator.onLine

                if (isNetworkErr) {
                    console.warn('[syncService] Gagal menghubungi server saat sinkronisasi, antrean ditahan:', err.message)
                    if (onStatusChange) onStatusChange('pending', queue.length)
                    break // Hentikan pemrosesan sementara
                } else if (err.status === 404) {
                    // Data di server sudah tidak ada, buang item dari antrean agar tidak menghambat
                    console.warn(`[syncService] Data ${current.productId} tidak ditemukan di server, antrean dilewati.`)
                    queue.shift()
                    saveQueue(queue)
                } else {
                    console.error('[syncService] Terjadi kesalahan pada antrean item:', err)
                    if (onStatusChange) onStatusChange('error', queue.length)
                    break
                }
            }
        }
    } finally {
        isSyncing = false
        const remaining = getQueue().length
        if (onStatusChange) {
            onStatusChange(remaining > 0 ? (navigator.onLine ? 'pending' : 'pending') : 'synced', remaining)
        }
    }
}
