import Link from 'next/link'
import { sql } from '@/lib/db'
import { rupiah } from '@/lib/utils'

export default async function AdminDashboardPage() {
    const [s] = await sql`
    SELECT
      (SELECT COUNT(*) FROM orders WHERE status = 'pending')::int AS pending,
      (SELECT COUNT(*) FROM orders
        WHERE (created_at AT TIME ZONE 'Asia/Jakarta')::date = (now() AT TIME ZONE 'Asia/Jakarta')::date)::int AS orders_today,
      (SELECT COALESCE(SUM(total), 0) FROM orders
        WHERE status <> 'dibatalkan'
          AND (created_at AT TIME ZONE 'Asia/Jakarta')::date = (now() AT TIME ZONE 'Asia/Jakarta')::date)::int AS revenue_today,
      (SELECT COUNT(*) FROM products)::int AS products,
      (SELECT COUNT(*) FROM products WHERE stock <= 5)::int AS low_stock`

    const cards = [
        ['Pesanan menunggu', String(s.pending), '/admin/pesanan'],
        ['Pesanan hari ini', String(s.orders_today), '/admin/pesanan'],
        ['Omzet hari ini', rupiah(s.revenue_today), '/admin/pesanan'],
        ['Jumlah produk', String(s.products), '/admin/produk'],
        ['Stok menipis (≤ 5)', String(s.low_stock), '/admin/produk'],
    ]

    return (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map(([label, value, href]) => (
                <Link key={label} href={href} className="border-2 border-ink bg-flour p-5 shadow-[4px_4px_0_#d8b98a] hover:bg-white" style={{ borderRadius: 4 }}>
                    <p className="label !mb-1">{label}</p>
                    <p className="font-display text-3xl">{value}</p>
                </Link>
            ))}
        </div>
    )
}