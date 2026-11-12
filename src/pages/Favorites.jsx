import ProductCard from '../components/ProductCard'

export default function Favorites({ products, onOpen, onFavorite, onAddToCart, qtyOf, onNavigate }) {
    const favs = products.filter((p) => p.favorite)

    return (
        <div className="space-y-6">
            <div className="border-b border-line pb-3">
                <p className="hand text-lg text-crust">yang kamu taksir</p>
                <h1 className="text-4xl">Roti favorit</h1>
                <p className="text-ink/60">{favs.length} roti yang kamu tandai</p>
            </div>

            {favs.length === 0 ? (
                <div className="border-2 border-dashed border-line py-14 text-center" style={{ borderRadius: 4 }}>
                    <p className="text-lg">Belum ada yang ditandai.</p>
                    <p className="mt-1 text-sm text-ink/60">Ketuk ikon hati di menu untuk menyimpan roti kesukaanmu di sini.</p>
                    <button onClick={() => onNavigate('menu')} className="btn btn-primary mt-5">Buka menu</button>
                </div>
            ) : (
                <div className="grid gap-x-6 gap-y-10 pt-2 sm:grid-cols-2 lg:grid-cols-3">
                    {favs.map((p, i) => (
                        <ProductCard key={p.id} product={p} index={i} onOpen={onOpen} onFavorite={onFavorite} onAddToCart={onAddToCart} inCart={qtyOf(p.id)} />
                    ))}
                </div>
            )}
        </div>
    )
}