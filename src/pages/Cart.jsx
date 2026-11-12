import { useState } from 'react'
import { Minus, Plus, Trash2, MessageCircle } from 'lucide-react'
import { rupiah, buildWhatsAppLink } from '../utils'
import ProductImage from '../components/ProductImage'

export default function Cart({ lines, total, count, setQty, removeFromCart, clearCart, onOpen, onNavigate }) {
    const [name, setName] = useState('')
    const [method, setMethod] = useState('ambil') // 'ambil' | 'antar'
    const [address, setAddress] = useState('')
    const [note, setNote] = useState('')
    const [errors, setErrors] = useState({})
    const [sent, setSent] = useState(false)

    if (lines.length === 0) {
        return (
            <div className="mx-auto max-w-md py-16 text-center">
                <p className="hand text-2xl text-crust">hmm, sepi ya...</p>
                <h1 className="mt-1 text-3xl">Keranjangmu masih kosong</h1>
                <p className="mt-2 text-ink/70">Pilih beberapa roti dulu, nanti kami bantu rapikan pesanannya.</p>
                <button onClick={() => onNavigate('menu')} className="btn btn-primary mt-6">Lihat menu</button>
            </div>
        )
    }

    // CHECKOUT -> buka WhatsApp dengan pesan pesanan yang sudah tersusun
    const handleCheckout = () => {
        const err = {}
        if (!name.trim()) err.name = 'Isi nama dulu supaya kami tahu siapa yang memesan'
        if (method === 'antar' && !address.trim()) err.address = 'Alamat pengantaran wajib diisi'
        setErrors(err)
        if (Object.keys(err).length) return

        const url = buildWhatsAppLink({ lines, total, name: name.trim(), method, address: address.trim(), note: note.trim() })
        const win = window.open(url, '_blank', 'noopener')
        if (!win) window.location.href = url // jika pop-up diblokir
        setSent(true)
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
                            <button onClick={() => onOpen(product.id)} className="photo h-24 w-24 shrink-0" aria-label={`Lihat ${product.name}`}>
                                <ProductImage product={product} letterSize="text-3xl" />
                            </button>
                            <div className="flex min-w-0 flex-1 flex-col">
                                <button onClick={() => onOpen(product.id)} className="text-left">
                                    <h3 className="truncate text-lg leading-tight hover:underline">{product.name}</h3>
                                </button>
                                <p className="text-sm text-ink/60">{rupiah(product.price)} / pcs</p>
                                <div className="mt-auto flex items-center justify-between pt-2">
                                    <div className="inline-flex items-center border-[1.5px] border-ink bg-flour" style={{ borderRadius: 4 }}>
                                        <button onClick={() => setQty(product.id, qty - 1)} aria-label="Kurangi" className="p-2 hover:bg-paper"><Minus size={14} /></button>
                                        <span className="w-8 text-center font-bold">{qty}</span>
                                        <button onClick={() => setQty(product.id, Math.min(product.stock, qty + 1))} disabled={qty >= product.stock} aria-label="Tambah" className="p-2 hover:bg-paper disabled:opacity-40"><Plus size={14} /></button>
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

                {/* Struk + form checkout */}
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
                            <span className="label">Nama kamu</span>
                            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="mis. Rosita" />
                            {errors.name && <span className="text-sm text-brick">{errors.name}</span>}
                        </label>

                        <div>
                            <span className="label">Pengambilan</span>
                            <div className="grid grid-cols-2 gap-2">
                                {[['ambil', 'Ambil di toko'], ['antar', 'Diantar']].map(([val, label]) => (
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

                        <button onClick={handleCheckout} className="btn btn-wa w-full !py-3 text-base">
                            <MessageCircle size={19} /> Checkout via WhatsApp
                        </button>
                        <p className="text-center text-xs text-ink/55">Kamu akan diarahkan ke WhatsApp dengan pesan yang sudah terisi.</p>

                        {sent && (
                            <div className="border-l-4 border-olive bg-paper px-3 py-2 text-sm">
                                WhatsApp sudah dibuka. Setelah pesan terkirim dan dikonfirmasi, kamu bisa{' '}
                                <button onClick={clearCart} className="font-bold text-crust underline underline-offset-4">kosongkan keranjang</button>.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}