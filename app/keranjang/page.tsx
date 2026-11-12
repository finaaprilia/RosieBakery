'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Minus, Plus, Trash2, ReceiptText } from 'lucide-react'
import { rupiah } from '@/lib/utils'
import ProductImage from '@/components/ProductImage'
import { useCart } from '@/components/CartProvider'

type Errors = { name?: string; address?: string; server?: string }

export default function CartPage() {
    const router = useRouter()
    const { user, lines, total, count, setQty, removeFromCart, clearCart, refresh, syncToDatabase } = useCart()
    const [name, setName] = useState(user?.name ?? '')
    const [method, setMethod] = useState<'ambil' | 'antar'>('ambil')
    const [address, setAddress] = useState('')
    const [note, setNote] = useState('')
    const [errors, setErrors] = useState<Errors>({})
    const [submitting, setSubmitting] = useState(false)
    const [orderId, setOrderId] = useState<number | null>(null)

    // Pesanan berhasil dibuat
    if (orderId) {
        return (
            <div className="mx-auto max-w-md py-16 text-center">
                <p className="hand text-2xl text-olive">terima kasih!</p>
                <h1 className="mt-1 text-3xl">Pesanan #{orderId} sudah tercatat</h1>
                <p className="mt-2 text-ink/70">Kami akan segera memprosesnya. Status pesanan bisa kamu pantau di halaman Profil.</p>
                <div className="mt-6 flex justify-center gap-3">
                    <Link href="/profile" className="btn btn-primary">Lihat pesanan</Link>
                    <Link href="/menu" className="btn btn-ghost">Pesan lagi</Link>
                </div>
            </div>
        )
    }

    if (lines.length === 0) {
        return (
            <div className="mx-auto max-w-md py-16 text-center">
                <p className="hand text-2xl text-crust">hmm, sepi ya...</p>
                <h1 className="mt-1 text-3xl">Keranjangmu masih kosong</h1>
                <p className="mt-2 text-ink/70">Pilih beberapa roti dulu, nanti kami bantu rapikan pesanannya.</p>
                <Link href="/menu" className="btn btn-primary mt-6">Lihat menu</Link>
            </div>
        )
    }

    // CHECKOUT -> buat pesanan di database
    const handleCheckout = async () => {
        const err: Errors = {}
        if (!name.trim()) err.name = 'Isi nama dulu supaya kami tahu siapa yang memesan'
        if (method === 'antar' && !address.trim()) err.address = 'Alamat pengantaran wajib diisi'
        setErrors(err)
        if (err.name || err.address) return

        if (!user) {
            router.push(`/login?next=${encodeURIComponent('/keranjang')}`)
            return
        }

        setSubmitting(true)
        await syncToDatabase()

        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, method, address, note }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
            setErrors({ server: data.error || 'Gagal membuat pesanan' })
            await refresh() // stok mungkin berubah
            setSubmitting(false)
            return
        }
        await clearCart()
        setOrderId(data.orderId)
        setSubmitting(false)
    }

    return (
        <div className="space-y-6">
            <div className="border-b border-line pb-3">
                <p className="hand text-lg text-crust">hampir selesai</p>
                <h1 className="text-4xl">Keranjang</h1>
                <p className="text-ink/60">{count} item siap dipesan</p>
            </div>

            <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-start">
                {/* Daftar item */}
                <ul className="divide-y divide-line border-y border-line">
                    {lines.map(({ product, qty }) => (
                        <li key={product.id} className="flex gap-4 py-4">
                            <Link href={`/menu/${product.id}`} className="photo h-24 w-24 shrink-0" aria-label={`Lihat ${product.name}`}>
                                <ProductImage product={product} letterSize="text-3xl" />
                            </Link>
                            <div className="flex min-w-0 flex-1 flex-col">
                                <Link href={`/menu/${product.id}`} className="text-left">
                                    <h3 className="truncate text-lg leading-tight hover:underline">{product.name}</h3>
                                </Link>
                                <p className="text-sm text-ink/60">{rupiah(product.price)} / pcs</p>
                                <div className="mt-auto flex items-center justify-between pt-2">
                                    <div className="inline-flex items-center border-[1.5px] border-ink bg-flour" style={{ borderRadius: 4 }}>
                                        <button onClick={() => setQty(product.id, qty - 1)} aria-label="Kurangi" className="p-2 hover:bg-paper"><Minus size={14} /></button>
                                        <span className="w-8 text-center font-bold">{qty}</span>
                                        <button onClick={() => setQty(product.id, qty + 1)} disabled={qty >= product.stock} aria-label="Tambah" className="p-2 hover:bg-paper disabled:opacity-40"><Plus size={14} /></button>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold">{rupiah(qty * product.price)}</span>
                                        <button onClick={() => removeFromCart(product.id)} aria-label={`Hapus ${product.name}`} className="text-brick hover:opacity-70"><Trash2 size={17} /></button>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                    <li className="py-3">
                        <button onClick={clearCart} className="text-sm font-bold text-brick underline underline-offset-4">Kosongkan keranjang</button>
                    </li>
                </ul>

                {/* Struk + form pemesanan */}
                <div className="receipt mono text-sm">
                    <h2 className="font-display text-center text-xl">Rosie Bakery</h2>
                    <p className="text-center text-xs text-ink/55">struk pesanan</p>
                    <div className="my-3 border-t border-dashed border-ink/40" />

                    <ul className="space-y-1.5">
                        {lines.map(({ product, qty }) => (
                            <li key={product.id} className="flex justify-between gap-3">
                                <span className="min-w-0 truncate">{qty}x {product.name}</span>
                                <span className="shrink-0">{rupiah(qty * product.price)}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="my-3 border-t border-dashed border-ink/40" />
                    <div className="flex justify-between text-base font-bold">
                        <span>TOTAL</span>
                        <span>{rupiah(total)}</span>
                    </div>

                    <div className="font-sans mt-6 space-y-4 text-[15px]">
                        <label className="block">
                            <span className="label">Nama pemesan</span>
                            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="mis. Rosita" />
                            {errors.name && <span className="text-sm text-brick">{errors.name}</span>}
                        </label>

                        <div>
                            <span className="label">Pengambilan</span>
                            <div className="grid grid-cols-2 gap-2">
                                {([['ambil', 'Ambil di toko'], ['antar', 'Diantar']] as const).map(([val, label]) => (
                                    <button
                                        key={val}
                                        type="button"
                                        onClick={() => setMethod(val)}
                                        className={`border-[1.5px] px-3 py-2 font-bold ${method === val ? 'border-crust bg-crust text-white' : 'border-line bg-flour text-ink/70'}`}
                                        style={{ borderRadius: 4 }}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {method === 'antar' && (
                            <label className="block">
                                <span className="label">Alamat pengantaran</span>
                                <textarea rows={2} className="input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Jalan, nomor, patokan" />
                                {errors.address && <span className="text-sm text-brick">{errors.address}</span>}
                            </label>
                        )}

                        <label className="block">
                            <span className="label">Catatan (opsional)</span>
                            <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="mis. tolong dipotong" />
                        </label>

                        {errors.server && <p className="border-l-4 border-brick bg-paper px-3 py-2 text-sm text-brick">{errors.server}</p>}

                        <button onClick={handleCheckout} disabled={submitting} className="btn btn-primary w-full !py-3 text-base">
                            <ReceiptText size={19} /> {submitting ? 'Memproses...' : 'Buat pesanan'}
                        </button>
                        {!user && (
                            <p className="text-center text-xs text-ink/70">
                                Kamu belum masuk. <Link href={`/login?next=${encodeURIComponent('/keranjang')}`} className="font-bold text-crust underline">Masuk atau Daftar</Link> untuk menyelesaikan pesanan.
                            </p>
                        )}
                        <p className="text-center text-xs text-ink/55">Pembayaran dilakukan saat pesanan diambil atau diantar.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
