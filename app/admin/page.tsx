import Link from 'next/link'
import { sql, getOrders } from '@/lib/db'
import { rupiah } from '@/lib/utils'
import OrderCard from '@/components/OrderCard'
import StatusSelect from './pesanan/StatusSelect'

export default async function AdminDashboardPage() {
    const [s] = await sql`
    SELECT
      (SELECT COUNT(*) FROM orders WHERE status = 'pending')::int AS pending,
      (SELECT COUNT(*) FROM orders WHERE status = 'diproses')::int AS processing,
      (SELECT COUNT(*) FROM orders WHERE status = 'siap')::int AS ready,
      (SELECT COUNT(*) FROM orders WHERE status = 'selesai')::int AS completed,
      (SELECT COUNT(*) FROM orders
        WHERE (created_at AT TIME ZONE 'Asia/Jakarta')::date = (now() AT TIME ZONE 'Asia/Jakarta')::date)::int AS orders_today,
      (SELECT COALESCE(SUM(total), 0) FROM orders
        WHERE status <> 'dibatalkan'
          AND date_trunc('month', created_at AT TIME ZONE 'Asia/Jakarta') = date_trunc('month', now() AT TIME ZONE 'Asia/Jakarta'))::int AS revenue_month,
      (SELECT COUNT(*) FROM products)::int AS products,
      (SELECT COUNT(*) FROM products WHERE stock <= 5)::int AS low_stock`

    const orders = await getOrders()
    const pendingOrders = orders.filter((o) => o.status === 'pending')
    const readyOrders = orders.filter((o) => o.status === 'siap')

    const cards = [
        ['Pesanan menunggu', String(s.pending), '/admin/pesanan?status=pending'],
        ['Sedang diproses', String(s.processing), '/admin/pesanan?status=diproses'],
        ['Siap diambil / diantar', String(s.ready), '/admin/pesanan?status=siap'],
        ['Pesanan selesai', String(s.completed), '/admin/pesanan?status=selesai'],
        ['Pesanan hari ini', String(s.orders_today), '/admin/pesanan'],
        ['Omzet bulan ini', rupiah(s.revenue_month), '/admin/pesanan'],
        ['Jumlah produk', String(s.products), '/admin/produk'],
        ['Stok menipis (≤ 5)', String(s.low_stock), '/admin/produk'],
    ]

    return (
        <div className="space-y-10">
            {/* Kartu Ringkasan Metrik */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {cards.map(([label, value, href]) => (
                    <Link
                        key={label}
                        href={href}
                        className="border-2 border-ink bg-flour p-5 shadow-[4px_4px_0_#d8b98a] transition hover:bg-white"
                        style={{ borderRadius: 4 }}
                    >
                        <p className="label !mb-1">{label}</p>
                        <p className="font-display text-3xl">{value}</p>
                    </Link>
                ))}
            </div>

            {/* Bagian Panel Pesanan Menunggu Konfirmasi */}
            <section className="space-y-4">
                <div className="flex items-baseline justify-between border-b border-line pb-2">
                    <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-crust animate-pulse" />
                        <h2 className="text-2xl font-bold">Menunggu Konfirmasi</h2>
                        <span className="rounded bg-kraft px-2 py-0.5 text-xs font-bold text-ink">
                            {pendingOrders.length}
                        </span>
                    </div>
                    <Link
                        href="/admin/pesanan?status=pending"
                        className="text-sm font-bold text-crust underline underline-offset-4"
                    >
                        Lihat semua
                    </Link>
                </div>

                {pendingOrders.length === 0 ? (
                    <div
                        className="border-2 border-dashed border-line p-8 text-center text-sm text-ink/60"
                        style={{ borderRadius: 4 }}
                    >
                        Semua pesanan sudah dikonfirmasi. Tidak ada pesanan menunggu saat ini.
                    </div>
                ) : (
                    <div className="grid gap-5 lg:grid-cols-2">
                        {pendingOrders.map((o) => (
                            <OrderCard key={o.id} order={o} showCustomer>
                                <StatusSelect id={o.id} status={o.status} />
                            </OrderCard>
                        ))}
                    </div>
                )}
            </section>

            {/* Bagian Panel Pesanan Siap Diambil / Diantar */}
            <section className="space-y-4">
                <div className="flex items-baseline justify-between border-b border-line pb-2">
                    <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-olive animate-pulse" />
                        <h2 className="text-2xl font-bold">Siap Diambil / Diantar</h2>
                        <span className="rounded bg-olive/15 px-2 py-0.5 text-xs font-bold text-olive">
                            {readyOrders.length}
                        </span>
                    </div>
                    <Link
                        href="/admin/pesanan?status=siap"
                        className="text-sm font-bold text-crust underline underline-offset-4"
                    >
                        Lihat semua
                    </Link>
                </div>

                {readyOrders.length === 0 ? (
                    <div
                        className="border-2 border-dashed border-line p-8 text-center text-sm text-ink/60"
                        style={{ borderRadius: 4 }}
                    >
                        Tidak ada pesanan yang siap diambil atau diantar saat ini.
                    </div>
                ) : (
                    <div className="grid gap-5 lg:grid-cols-2">
                        {readyOrders.map((o) => (
                            <OrderCard key={o.id} order={o} showCustomer>
                                <StatusSelect id={o.id} status={o.status} />
                            </OrderCard>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}
