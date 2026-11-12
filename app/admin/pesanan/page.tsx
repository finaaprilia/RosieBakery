import { getOrders } from '@/lib/db'
import OrderCard from '@/components/OrderCard'
import StatusSelect from './StatusSelect'

export default async function AdminOrdersPage() {
    const orders = await getOrders() // semua pesanan

    if (orders.length === 0) {
        return <p className="py-10 text-center text-ink/65">Belum ada pesanan masuk.</p>
    }

    return (
        <div className="grid gap-5 lg:grid-cols-2">
            {orders.map((o) => (
                <OrderCard key={o.id} order={o} showCustomer>
                    <StatusSelect id={o.id} status={o.status} />
                </OrderCard>
            ))}
        </div>
    )
}