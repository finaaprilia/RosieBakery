import { useState, useMemo } from 'react'
import { Plus, Search } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import ProductForm from '../components/ProductForm'
import ConfirmModal from '../components/ConfirmModal'
import { CATEGORIES } from '../data/seed'

// Halaman CRUD: Create (Tambah), Read (daftar + cari + filter), Update (Edit), Delete (Hapus)
export default function Menu({ products, loading, error, refetch, addProduct, updateProduct, deleteProduct, toggleFavorite, onOpen, onAddToCart, qtyOf }) {
    const [query, setQuery] = useState('')
    const [category, setCategory] = useState('Semua')
    const [formOpen, setFormOpen] = useState(false)
    const [editing, setEditing] = useState(null)
    const [deleting, setDeleting] = useState(null)
    const [toast, setToast] = useState('')

    const showToast = (msg) => {
        setToast(msg)
        setTimeout(() => setToast(''), 2200)
    }

    const filtered = useMemo(
        () =>
            products.filter(
                (p) =>
                    (category === 'Semua' || p.category === category) &&
                    p.name.toLowerCase().includes(query.toLowerCase()),
            ),
        [products, query, category],
    )

    const openCreate = () => { setEditing(null); setFormOpen(true) }
    const openEdit = (p) => { setEditing(p); setFormOpen(true) }

    // CREATE / UPDATE: Disimpan lokal seketika & dimasukkan ke antrean sinkronisasi
    const handleSubmit = async (data) => {
        try {
            if (editing) {
                await updateProduct(editing.id, data)
                showToast(navigator.onLine ? 'Perubahan disimpan' : 'Perubahan disimpan lokal (menunggu sinkronisasi)')
            } else {
                await addProduct(data)
                showToast(navigator.onLine ? 'Roti baru ditambahkan' : 'Roti baru disimpan lokal (menunggu sinkronisasi)')
            }
            setFormOpen(false)
            setEditing(null)
        } catch (err) {
            showToast(`Gagal menyimpan: ${err.message}`)
        }
    }

    // DELETE: Dihapus lokal seketika & dimasukkan ke antrean sinkronisasi
    const confirmDelete = async () => {
        try {
            await deleteProduct(deleting.id)
            showToast(navigator.onLine ? 'Roti dihapus dari menu' : 'Roti dihapus lokal (menunggu sinkronisasi)')
        } catch (err) {
            showToast(`Gagal menghapus: ${err.message}`)
        }
        setDeleting(null)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-end justify-between gap-3 border-b border-line pb-3">
                <div>
                    <p className="hand text-lg text-crust">semua yang ada di etalase</p>
                    <h1 className="text-4xl">Menu roti</h1>
                </div>
                <button onClick={openCreate} className="btn btn-primary">
                    <Plus size={18} /> Tambah roti
                </button>
            </div>

            {error && (
                <div className="flex items-center justify-between gap-3 border-l-4 border-brick bg-flour px-4 py-3 text-sm">
                    <span>Tidak bisa terhubung ke server ({error}). Yang tampil adalah data tersimpan terakhir.</span>
                    <button onClick={refetch} className="btn btn-ghost !px-3 !py-1.5 text-sm">Coba lagi</button>
                </div>
            )}

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

            {loading && products.length === 0 ? (
                <p className="py-14 text-center text-ink/60">Memuat menu dari dapur...</p>
            ) : filtered.length === 0 ? (
                <div className="border-2 border-dashed border-line py-14 text-center" style={{ borderRadius: 4 }}>
                    <p className="text-lg">{products.length === 0 ? 'Menu masih kosong.' : 'Tidak ada roti yang cocok.'}</p>
                    <p className="text-sm text-ink/60">
                        {products.length === 0 ? 'Tambahkan roti pertama, atau isi data contoh dari halaman Profil.' : 'Coba kata kunci lain, atau tambahkan roti baru.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-x-6 gap-y-10 pt-2 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((p, i) => (
                        <ProductCard
                            key={p.id}
                            product={p}
                            index={i}
                            onOpen={onOpen}
                            onFavorite={toggleFavorite}
                            onAddToCart={onAddToCart}
                            inCart={qtyOf(p.id)}
                            onEdit={openEdit}
                            onDelete={setDeleting}
                        />
                    ))}
                </div>
            )}

            {formOpen && <ProductForm initial={editing} onSubmit={handleSubmit} onClose={() => { setFormOpen(false); setEditing(null) }} />}
            {deleting && (
                <ConfirmModal title={`Hapus "${deleting.name}"?`} message="Roti ini akan dihapus dari menu dan tidak bisa dikembalikan." onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />
            )}
            {toast && (
                <div className="fade-up fixed bottom-24 left-1/2 z-50 -translate-x-1/2 bg-ink px-5 py-3 text-sm font-bold text-paper md:bottom-8" style={{ borderRadius: 4 }}>
                    {toast}
                </div>
            )}
        </div>
    )
}
