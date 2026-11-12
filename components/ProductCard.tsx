'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { rupiah } from '@/lib/utils'
import type { Product } from '@/lib/types'
import ProductImage from './ProductImage'
import { useCart } from './CartProvider'

type Props = {
    product: Product
    index?: number
    onEdit?: (product: Product) => void   // khusus halaman admin
    onDelete?: (product: Product) => void // khusus halaman admin
}

export default function ProductCard({ product, index = 0, onEdit, onDelete }: Props) {
    const { addToCart, qtyOf } = useCart()
    const { name, category, price, stock, description } = product
    const soldOut = stock <= 0
    const low = stock > 0 && stock <= 5
    const inCart = qtyOf(product.id)
    const isAdminView = Boolean(onEdit || onDelete)

    return (
        <article className="fade-up group flex flex-col" style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}>
            <div className="relative">
                <Link href={`/menu/${product.id}`} className="photo block aspect-[4/3] w-full" aria-label={`Lihat ${name}`}>
                    <span className={`block h-full w-full transition duration-300 group-hover:scale-[1.04] ${soldOut ? 'grayscale' : ''}`}>
                        <ProductImage product={product} />
                    </span>
                </Link>

                <span className="price-tag absolute -bottom-3 left-3 shadow-sm">{rupiah(price)}</span>

                {soldOut && (
                    <span className="hand absolute left-3 top-3 rotate-[-4deg] border-2 border-brick bg-flour px-2 text-lg font-bold text-brick">habis</span>
                )}
            </div>

            <div className="flex flex-1 flex-col pt-6">
                <p className="text-[11px] font-bold uppercase tracking-widest text-ink/50">{category}</p>
                <Link href={`/menu/${product.id}`} className="text-left">
                    <h3 className="text-xl leading-tight decoration-crust decoration-2 underline-offset-4 hover:underline">{name}</h3>
                </Link>
                <p className="mt-1 line-clamp-2 text-[15px] text-ink/70">{description}</p>

                <div className="mt-3 flex items-center justify-between gap-2">
                    <span className={`hand text-base ${low ? 'font-bold text-brick' : 'text-ink/55'}`}>
                        {soldOut ? 'stok kosong' : low ? `tinggal ${stock}!` : `stok ${stock}`}
                    </span>
                    {!isAdminView && (
                        <button
                            onClick={() => addToCart(product)}
                            disabled={soldOut || inCart >= stock}
                            className="btn btn-ghost !px-3 !py-1.5 text-sm"
                        >
                            <Plus size={15} /> Keranjang{inCart > 0 && <span className="text-crust">({inCart})</span>}
                        </button>
                    )}
                </div>

                {isAdminView && (
                    <div className="mt-3 flex gap-4 border-t border-dashed border-line pt-2 text-sm font-bold">
                        {onEdit && <button onClick={() => onEdit(product)} className="text-crust underline underline-offset-4">Edit</button>}
                        {onDelete && <button onClick={() => onDelete(product)} className="text-brick underline underline-offset-4">Hapus</button>}
                    </div>
                )}
            </div>
        </article>
    )
}