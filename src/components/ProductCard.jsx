import { Heart, Plus } from 'lucide-react'
import { rupiah } from '../utils'
import ProductImage from './ProductImage'

export default function ProductCard({ product, index = 0, onOpen, onFavorite, onAddToCart, onEdit, onDelete, inCart = 0 }) {
    const { name, category, price, stock, description, favorite } = product
    const soldOut = stock <= 0
    const low = stock > 0 && stock <= 5

    return (
        <article className="fade-up group flex flex-col" style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}>
            <div className="relative">
                <button onClick={() => onOpen(product.id)} className="photo block aspect-[4/3] w-full" aria-label={`Lihat ${name}`}>
                    <span className={`block h-full w-full transition duration-300 group-hover:scale-[1.04] ${soldOut ? 'grayscale' : ''}`}>
                        <ProductImage product={product} />
                    </span>
                </button>

                <span className="price-tag absolute -bottom-3 left-3 shadow-sm">{rupiah(price)}</span>

                <button
                    onClick={() => onFavorite(product.id)}
                    aria-label={favorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
                    className="absolute right-2 top-2 border-[1.5px] border-ink bg-flour p-1.5 hover:bg-white"
                    style={{ borderRadius: 3 }}
                >
                    <Heart size={16} className={favorite ? 'fill-crust text-crust' : 'text-ink/70'} />
                </button>

                {soldOut && (
                    <span className="hand absolute left-3 top-3 rotate-[-4deg] border-2 border-brick bg-flour px-2 text-lg font-bold text-brick">habis</span>
                )}
            </div>

            <div className="flex flex-1 flex-col pt-6">
                <p className="text-[11px] font-bold uppercase tracking-widest text-ink/50">{category}</p>
                <button onClick={() => onOpen(product.id)} className="text-left">
                    <h3 className="text-xl leading-tight decoration-crust decoration-2 underline-offset-4 hover:underline">{name}</h3>
                </button>
                <p className="mt-1 line-clamp-2 text-[15px] text-ink/70">{description}</p>

                <div className="mt-3 flex items-center justify-between gap-2">
                    <span className={`hand text-base ${low ? 'font-bold text-brick' : 'text-ink/55'}`}>
                        {soldOut ? 'stok kosong' : low ? `tinggal ${stock}!` : `stok ${stock}`}
                    </span>
                    {onAddToCart && (
                        <button onClick={() => onAddToCart(product)} disabled={soldOut || inCart >= stock} className="btn btn-ghost !px-3 !py-1.5 text-sm">
                            <Plus size={15} /> Keranjang{inCart > 0 && <span className="text-crust">({inCart})</span>}
                        </button>
                    )}
                </div>

                {(onEdit || onDelete) && (
                    <div className="mt-3 flex gap-4 border-t border-dashed border-line pt-2 text-sm font-bold">
                        {onEdit && <button onClick={() => onEdit(product)} className="text-crust underline underline-offset-4">Edit</button>}
                        {onDelete && <button onClick={() => onDelete(product)} className="text-brick underline underline-offset-4">Hapus</button>}
                    </div>
                )}
            </div>
        </article>
    )
}