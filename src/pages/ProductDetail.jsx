import { useState } from 'react'
import { ArrowLeft, Heart, Minus, Plus, ShoppingBasket } from 'lucide-react'
import { rupiah } from '../utils'
import ProductImage from '../components/ProductImage'
import ProductCard from '../components/ProductCard'

export default function ProductDetail({ product, products, onBack, onOpen, onFavorite, onAddToCart, qtyOf, onGoCart }) {
    const [qty, setQty] = useState(1)
    const [added, setAdded] = useState(false)

    if (!product) {
        return (
            <div className="py-20 text-center">
                <p className="text-lg">Roti ini sudah tidak ada di menu.</p>
                <button onClick={onBack} className="btn btn-primary mt-5">Kembali</button>
            </div>
        )
    }

    const inCart = qtyOf(product.id)
    const maxAdd = Math.max(product.stock - inCart, 0)
    const soldOut = product.stock <= 0
    const related = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 3)

    const handleAdd = () => {
        onAddToCart(product, Math.min(qty, maxAdd))
        setAdded(true)
        setQty(1)
        setTimeout(() => setAdded(false), 1800)
    }

    return (
        <div className="space-y-14">
            <button onClick={onBack} className="inline-flex items-center gap-2 font-bold text-ink/70 hover:text-crust">
                <ArrowLeft size={18} /> Kembali
            </button>

            <div className="fade-up grid gap-10 md:grid-cols-2 md:items-start">
                <div className="relative">
                    <div className="photo aspect-[4/3] w-full shadow-[8px_8px_0_#d8b98a] md:aspect-square">
                        <span className={`block h-full w-full ${soldOut ? 'grayscale' : ''}`}>
                            <ProductImage product={product} letterSize="text-9xl" />
                        </span>
                    </div>
                    <span className="tape -top-3 left-6 rotate-[-5deg]" />
                    <span className="tape -top-2 right-8 rotate-[4deg]" />
                </div>

                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-ink/50">{product.category}</p>
                    <h1 className="mt-1 text-4xl leading-tight sm:text-5xl">{product.name}</h1>
                    <p className="mt-4"><span className="price-tag !text-xl">{rupiah(product.price)}</span></p>

                    <p className="mt-6 max-w-md text-lg text-ink/80">{product.description || 'Belum ada deskripsi untuk roti ini.'}</p>

                    <p className={`hand mt-5 text-xl ${product.stock <= 5 ? 'font-bold text-brick' : 'text-olive'}`}>
                        {soldOut ? 'Maaf, stok sedang kosong' : product.stock <= 5 ? `Tinggal ${product.stock}, buruan!` : `Stok ${product.stock} tersedia hari ini`}
                    </p>

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
                            <button onClick={onGoCart} className="font-bold text-crust underline underline-offset-4">Lihat keranjang</button>
                        </p>
                    )}

                    <button onClick={() => onFavorite(product.id)} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-ink/70 hover:text-crust">
                        <Heart size={17} className={product.favorite ? 'fill-crust text-crust' : ''} />
                        {product.favorite ? 'Ada di favoritmu' : 'Simpan ke favorit'}
                    </button>
                </div>
            </div>

            {related.length > 0 && (
                <section>
                    <h2 className="mb-8 border-b border-line pb-2 text-2xl">Dari kategori yang sama</h2>
                    <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                        {related.map((p, i) => (
                            <ProductCard key={p.id} product={p} index={i} onOpen={onOpen} onFavorite={onFavorite} onAddToCart={onAddToCart} inCart={qtyOf(p.id)} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}