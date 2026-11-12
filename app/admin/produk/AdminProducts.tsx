'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import type { Product } from '@/lib/types'
import ProductCard from '@/components/ProductCard'
import ProductForm, { type ProductPayload } from '@/components/ProductForm'
import ConfirmModal from '@/components/ConfirmModal'

// CRUD produk: Create (Tambah), Read (daftar), Update (Edit), Delete (Hapus)
export default function AdminProducts({ products }: { products: Product[] }) {
    const router = useRouter()
    const [formOpen, setFormOpen] = useState(false)
    const [editing, setEditing] = useState<Product | null>(null)
    const [deleting, setDeleting] = useState<Product | null>(null)
    const [toast, setToast] = useState('')

    const showToast = (msg: string) => {
        setToast(msg)
        setTimeout(() => setToast(''), 2200)
    }

    const closeForm = () => {
        setFormOpen(false)
        setEditing(null)
    }

    // CREATE / UPDATE
    const handleSubmit = async (data: ProductPayload) => {
        const res = await fetch('/api/products', {
            method: editing ? 'PATCH' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editing ? { ...data, id: editing.id } : data),
        })
        if (!res.ok) {
            const body = await res.json().catch(() => ({}))
            showToast(`Gagal menyimpan: ${body.error ?? res.status}`)
            return
        }
        showToast(editing ? 'Perubahan disimpan' : 'Roti baru ditambahkan')
        closeForm()
        router.refresh() // ambil ulang data produk dari server
    }

    // DELETE
    const confirmDelete = async () => {
        if (!deleting) return
        const res = await fetch(`/api/products?id=${deleting.id}`, { method: 'DELETE' })
        showToast(res.ok ? 'Roti dihapus dari menu' : 'Gagal menghapus')
        setDeleting(null)
        router.refresh()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
                <p className="text-ink/65">{products.length} produk</p>
                <button onClick={() => { setEditing(null); setFormOpen(true) }} className="btn btn-primary">
                    <Plus size={18} /> Tambah roti
                </button>
            </div>

            {products.length === 0 ? (
                <div className="border-2 border-dashed border-line py-14 text-center" style={{ borderRadius: 4 }}>
                    <p className="text-lg">Menu masih kosong.</p>
                    <p className="text-sm text-ink/60">Tambahkan roti pertama lewat tombol di atas.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-x-6 gap-y-10 pt-2 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map((p, i) => (
                        <ProductCard
                            key={p.id}
                            product={p}
                            index={i}
                            onEdit={(prod) => { setEditing(prod); setFormOpen(true) }}
                            onDelete={setDeleting}
                        />
                    ))}
                </div>
            )}

            {formOpen && <ProductForm initial={editing} onSubmit={handleSubmit} onClose={closeForm} />}
            {deleting && (
                <ConfirmModal
                    title={`Hapus "${deleting.name}"?`}
                    message="Roti ini akan dihapus dari menu dan tidak bisa dikembalikan. Riwayat pesanan lama tetap aman."
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleting(null)}
                />
            )}
            {toast && (
                <div className="fade-up fixed bottom-24 left-1/2 z-50 -translate-x-1/2 bg-ink px-5 py-3 text-sm font-bold text-paper md:bottom-8" style={{ borderRadius: 4 }}>
                    {toast}
                </div>
            )}
        </div>
    )
}