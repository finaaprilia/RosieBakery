import type { ReactNode } from 'react'
import { Phone } from 'lucide-react'
import { rupiah } from '@/lib/utils'
import { STATUS_LABEL } from '@/lib/constants'
import type { Order } from '@/lib/types'

const STATUS_STYLE: Record<Order['status'], string> = {
    pending: 'bg-kraft text-ink',
    diproses: 'bg-crust text-white',
    siap: 'bg-olive text-white',
    selesai: 'bg-ink text-paper',
    dibatalkan: 'bg-brick text-white',
}

// Kartu satu pesanan. `children` dipakai admin untuk menaruh kontrol ubah status.
    export default function OrderCard({
        order,
        showCustomer = false,
        children,
    }: {
        order: Order
        showCustomer?: boolean
        children?: ReactNode
    }) {
        const rawPhone = order.user_phone?.trim()
        const cleanPhone = rawPhone ? rawPhone.replace(/[^0-9+]/g, '') : ''
        const waPhone = cleanPhone.startsWith('0')
            ? '62' + cleanPhone.slice(1)
            : cleanPhone.replace(/^\+/, '')

        return (
            <article className="border-2 border-ink bg-flour p-4 shadow-[4px_4px_0_#d8b98a]" style={{ borderRadius: 4 }}>
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-dashed border-line pb-2">
                    <div>
                        <p className="mono text-sm font-bold">Pesanan #{order.id}</p>
                        <p className="text-xs text-ink/55">{order.created_label}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-bold ${STATUS_STYLE[order.status]}`} style={{ borderRadius: 3 }}>
                        {STATUS_LABEL[order.status]}
                    </span>
                </div>

                {showCustomer && (
                <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                    <span className="font-bold text-ink">{order.customer_name}</span>
                    {order.user_email && <span className="text-ink/55">({order.user_email})</span>}
                    {rawPhone ? (
                        <div className="inline-flex items-center gap-1.5">
                            <span className="text-ink/30">&bull;</span>
                            <Phone size={13} className="text-crust shrink-0" />
                            <a
                                href={`tel:${cleanPhone}`}
                                className="font-bold text-crust underline underline-offset-2 transition hover:text-crust-dark"
                                title="Klik untuk menelepon"
                            >
                                {rawPhone}
                            </a>
                            <a
                                href={`https://wa.me/${waPhone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center rounded bg-olive/15 px-1.5 py-0.5 text-[11px] font-bold text-olive transition hover:bg-olive/25"
                                title="Chat via WhatsApp"
                            >
                                WA
                            </a>
                        </div>
                    ) : (
                        <span className="text-xs text-ink/40">&bull; (No. HP tidak terdaftar)</span>
                    )}
                </div>
                )}

                <ul className="mono mt-2 space-y-1 text-sm">
                    {order.items.map((it, i) => (
                        <li key={i} className="flex justify-between gap-3">
                            <span className="min-w-0 truncate">{it.qty}x {it.name}</span>
                            <span className="shrink-0">{rupiah(it.qty * it.price)}</span>
                        </li>
                    ))}
                </ul>

                <div className="mono mt-2 flex justify-between border-t border-dashed border-ink/40 pt-2 font-bold">
                    <span>TOTAL</span>
                    <span>{rupiah(order.total)}</span>
                </div>

                <p className="mt-2 text-sm text-ink/70">
                    {order.method === 'antar' ? `Diantar ke: ${order.address}` : 'Ambil di toko'}
                    {order.note ? ` · Catatan: ${order.note}` : ''}
                </p>

                {children && <div className="mt-3 border-t border-line pt-3">{children}</div>}
            </article>
        )
    }
