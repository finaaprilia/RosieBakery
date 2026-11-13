import Link from 'next/link'
import { getOrders } from '@/lib/db'
import OrderCard from '@/components/OrderCard'
import StatusSelect from './StatusSelect'
import { ORDER_STATUSES, STATUS_LABEL } from '@/lib/constants'

export default async function AdminOrdersPage({
    searchParams,
}: {
    searchParams?: Promise<{ status?: string }>
}) {
    const { status } = (await searchParams) ?? {}
    const allOrders = await getOrders() // semua pesanan

    const filtered = status ? allOrders.filter((o) => o.status === status) : allOrders

    const tabs = [
        { href: '/admin/pesanan', label: 'Semua', count: allOrders.length, active: !status },
        ...ORDER_STATUSES.map((s) => ({
            href: `/admin/pesanan?status=${s}`,
            label: STATUS_LABEL[s],
            count: allOrders.filter((o) => o.status === s).length,
            active: status === s,
        })),
    ]

    return (
        <div className="space-y-6">
            {/* Filter Tabs Status Pesanan */}
            <div className="-mx-4 flex gap-2 overflow-x-auto border-b border-line px-4 pb-2 md:mx-0 md:px-0">
                {tabs.map((t) => (
                    <Link
                        key={t.href}
                        href={t.href}
                        className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded px-3 py-1.5 text-xs font-bold transition ${
                            t.active
                                ? 'bg-crust text-white shadow-sm'
                                : 'border border-line bg-flour text-ink/70 hover:bg-paper hover:text-ink'
                        }`}
                    >
                        <span>{t.label}</span>
                        <span
                            className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                                t.active ? 'bg-white/20 text-white' : 'bg-ink/10 text-ink/70'
                            }`}
                        >
                            {t.count}
                        </span>
                    </Link>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div
                    className="border-2 border-dashed border-line py-12 text-center text-ink/65"
                    style={{ borderRadius: 4 }}
                >
                    <p className="text-lg">Tidak ada pesanan dengan status ini.</p>
                </div>
            ) : (
                <div className="grid gap-5 lg:grid-cols-2">
                    {filtered.map((o) => (
                        <OrderCard key={o.id} order={o} showCustomer>
                            <StatusSelect id={o.id} status={o.status} />
                        </OrderCard>
                    ))}
                </div>
            )}
        </div>
    )
}
