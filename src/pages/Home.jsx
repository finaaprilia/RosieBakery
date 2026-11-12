import { rupiah } from '../utils'
import ProductCard from '../components/ProductCard'
import ProductImage from '../components/ProductImage'

const STEPS = [
    ['Pilih rotinya', 'Buka menu, ketuk roti yang kamu mau untuk lihat detailnya.'],
    ['Masukkan keranjang', 'Atur jumlahnya. Stok yang tampil adalah stok yang benar-benar ada hari ini.'],
    ['Kirim lewat WhatsApp', 'Pesananmu langsung tersusun rapi di chat. Tinggal kirim, kami yang siapkan.'],
]

export default function Home({ products, onNavigate, onOpen, onFavorite, onAddToCart, qtyOf }) {
    const board = products.slice(0, 6)
    const withPhoto = products.filter((p) => p.image_url)
    const collage = (withPhoto.length >= 3 ? withPhoto : products).slice(0, 3)
    const featured = (products.filter((p) => p.favorite).length ? products.filter((p) => p.favorite) : products).slice(0, 3)

    return (
        <div className="space-y-16">
            {/* Hero */}
            <section className="fade-up grid items-center gap-10 md:grid-cols-[1.1fr_1fr]">
                <div>
                    <h1 className="text-4xl leading-[1.1] sm:text-5xl">
                        Roti hangat yang adonannya diistirahatkan semalam.
                    </h1>
                    <p className="mt-4 max-w-lg text-ink/75">
                        Di dapur kecil ini aku membuat roti dengan sabar. Pagi-pagi oven sudah menyala, dan apa pun yang keluar
                        dari sana langsung kami taruh di etalase.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <button onClick={() => onNavigate('menu')} className="btn btn-primary">Lihat menu</button>
                        <button onClick={() => onNavigate('cart')} className="btn btn-ghost">Buka keranjang</button>
                    </div>
                </div>

                {/* Kolase foto yang "ditempel" */}
                {collage.length > 0 && (
                    <div className="relative mx-auto h-[300px] w-full max-w-md sm:h-[340px]">
                        {collage.map((p, i) => {
                            const pos = [
                                'left-0 top-4 w-[58%] -rotate-3',
                                'right-0 top-0 w-[46%] rotate-2',
                                'bottom-0 right-[12%] w-[52%] -rotate-1',
                            ][i]
                            return (
                                <button
                                    key={p.id}
                                    onClick={() => onOpen(p.id)}
                                    className={`photo absolute aspect-[4/5] shadow-[5px_5px_0_rgba(42,28,19,.85)] transition hover:z-10 hover:scale-[1.03] ${pos}`}
                                    aria-label={`Lihat ${p.name}`}
                                >
                                    <ProductImage product={p} letterSize="text-5xl" />
                                    <span className="tape -top-3 left-1/2 -translate-x-1/2 rotate-[-4deg]" />
                                </button>
                            )
                        })}
                    </div>
                )}
            </section>

            {/* Papan harga */}
            <section className="grid gap-8 md:grid-cols-[1fr_1.2fr] md:items-start">
                <div>
                    <h2 className="text-3xl">Papan hari ini</h2>
                    <p className="mt-2 max-w-sm text-ink/70">
                        Seperti papan tulis di depan toko. Harga dan stok ikut berubah setiap kali menu diperbarui.
                    </p>
                </div>
                <div className="border-2 border-ink bg-ink p-5 text-paper shadow-[5px_5px_0_#d8b98a]" style={{ borderRadius: 4 }}>
                    {board.length === 0 && <p className="text-sm text-paper/70">Belum ada menu. Isi data contoh dari halaman Profil.</p>}
                    <ul className="space-y-3">
                        {board.map((p) => (
                            <li key={p.id}>
                                <button onClick={() => onOpen(p.id)} className="flex w-full items-baseline gap-2 text-left hover:text-kraft">
                                    <span>{p.name}</span>
                                    <span className="flex-1 border-b border-dotted border-paper/40" />
                                    <span className="font-bold">{rupiah(p.price)}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Favorit */}
            {featured.length > 0 && (
                <section>
                    <div className="mb-8 flex items-baseline justify-between border-b border-line pb-2">
                        <h2 className="text-3xl">Yang sering dicari</h2>
                        <button onClick={() => onNavigate('menu')} className="text-sm font-bold text-crust underline underline-offset-4">Semua menu</button>
                    </div>
                    <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                        {featured.map((p, i) => (
                            <ProductCard key={p.id} product={p} index={i} onOpen={onOpen} onFavorite={onFavorite} onAddToCart={onAddToCart} inCart={qtyOf(p.id)} />
                        ))}
                    </div>
                </section>
            )}

            {/* Cara pesan */}
            <section className="border-t-2 border-ink pt-8">
                <h2 className="mb-6 text-3xl">Cara memesan</h2>
                <ol className="grid gap-6 md:grid-cols-3">
                    {STEPS.map(([title, text], i) => (
                        <li key={title} className="flex gap-4">
                            <span className="font-display text-5xl leading-none text-crust">{i + 1}</span>
                            <div>
                                <h3 className="text-lg">{title}</h3>
                                <p className="mt-1 text-[15px] text-ink/70">{text}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </section>
        </div>
    )
}