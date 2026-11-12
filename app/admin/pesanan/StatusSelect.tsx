'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ORDER_STATUSES, STATUS_LABEL } from '@/lib/constants'
import type { OrderStatus } from '@/lib/types'
import ConfirmModal from '@/components/ConfirmModal'

export default function StatusSelect({ id, status }: { id: number; status: OrderStatus }) {
    const router = useRouter()
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')
    const [pendingCancel, setPendingCancel] = useState(false)

    const update = async (next: OrderStatus) => {
        setBusy(true)
        setError('')
        const res = await fetch('/api/orders', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status: next }),
        })
        if (!res.ok) {
            const body = await res.json().catch(() => ({}))
            setError(body.error ?? 'Gagal mengubah status')
        }
        setBusy(false)
        router.refresh()
    }

    const onChange = (next: OrderStatus) => {
        if (next === 'dibatalkan') setPendingCancel(true)
        else update(next)
    }

    return (
        <div>
            <label className="label">Ubah status</label>
            <select
                className="input"
                value={status}
                disabled={busy || status === 'dibatalkan'}
                onChange={(e) => onChange(e.target.value as OrderStatus)}
            >
                {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                ))}
            </select>
            {error && <p className="mt-1 text-sm text-brick">{error}</p>}

            {pendingCancel && (
                <ConfirmModal
                    title={`Batalkan pesanan #${id}?`}
                    message="Stok roti dalam pesanan ini akan dikembalikan, dan pesanan tidak bisa diaktifkan lagi."
                    confirmLabel="Ya, batalkan"
                    onConfirm={() => { setPendingCancel(false); update('dibatalkan') }}
                    onCancel={() => setPendingCancel(false)}
                />
            )}
        </div>
    )
}