import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { rupiah } from '@/lib/utils'
import { getProduct, getProducts } from '@/lib/db'
import ProductImage from '@/components/ProductImage'
import ProductCard from '@/components/ProductCard'
import ProductActions from '@/components/ProductActions'

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const productId = Number(id)
    const product = Number.isInteger(productId) ? await getProduct(productId) : null

    if (!product) {
        return (
            <div className="py-20 text-center">
                <p className="text-lg">Roti ini sudah tidak ada di menu.</p>
                <Link href="/menu" className="btn btn-primary mt-5">Kembali</Link>
            </div>
        )
    }

    const soldOut = product.stock <= 0
    const related = (await getProducts())
        .filter((p) => p.id !== product.id && p.category === product.category)
        .slice(0, 3)

    return (
        <div className="space-y-14">
            <Link href="/menu" className="inline-flex items-center gap-2 font-bold text-ink/70 hover:text-crust">
                <ArrowLeft size={18} /> Kembali
            </Link>

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

                    <ProductActions product={product} />
                </div>
            </div>

            {related.length > 0 && (
                <section>
                    <h2 className="mb-8 border-b border-line pb-2 text-2xl">Dari kategori yang sama</h2>
                    <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                        {related.map((p, i) => (
                            <ProductCard key={p.id} product={p} index={i} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}