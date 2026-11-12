import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getOrders } from '@/lib/db'
import OrderCard from '@/components/OrderCard'
import LogoutButton from '@/components/LogoutButton'

export const metadata = { title: 'Profil — Rosie Bakery' }

export default async function ProfilePage() {
    const user = await getSession()
    if (!user) redirect('/login?next=/profile')

    const orders = await getOrders(user.id)
    const initials = user.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()

    const rows = [
        ['Nama', user.name],
        ['Email', user.email],
        ['Jumlah pesanan', String(orders.length)],
    ]

    return (
        <div className="mx-auto max-w-xl space-y-10">
            <section className="fade-up relative">
                <span className="tape -top-3 left-8 rotate-[-4deg]" />
                <div className="border-2 border-ink bg-flour shadow-[6px_6px_0_#d8b98a]" style={{ borderRadius: 4 }}>
                    <div className="flex items-center gap-4 border-b-2 border-ink bg-crust p-5 text-paper">
                        <div className="font-display flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-paper text-2xl">{initials}</div>
                        <div>
                            <p className="hand text-lg leading-none text-kraft">{user.role === 'admin' ? 'pemilik dapur' : 'pelanggan setia'}</p>
                            <h1 className="text-2xl leading-tight">{user.name}</h1>
                            <p className="text-paper/80">{user.role === 'admin' ? 'Admin Rosie Bakery' : 'Pelanggan Rosie Bakery'}</p>
                        </div>
                    </div>

                    <dl className="divide-y divide-line">
                        {rows.map(([label, value]) => (
                            <div key={label} className="flex items-baseline justify-between gap-4 px-5 py-4">
                                <dt className="label !mb-0">{label}</dt>
                                <dd className="text-lg font-bold">{value}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
                <div className="mt-4 flex justify-end"><LogoutButton /></div>
            </section>

            <section>
                <h2 className="mb-4 border-b border-line pb-2 text-2xl">Riwayat pesanan</h2>
                {orders.length === 0 ? (
                    <p className="text-ink/65">Belum ada pesanan. Yuk pilih roti dari menu.</p>
                ) : (
                    <div className="space-y-5">
                        {orders.map((o) => <OrderCard key={o.id} order={o} />)}
                    </div>
                )}
            </section>
        </div>
    )
}