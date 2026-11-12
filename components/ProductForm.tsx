'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { CATEGORIES } from '@/lib/constants'
import type { Product } from '@/lib/types'
import ImageField from './ImageField'

export type ProductPayload = {
    name: string
    category: string
    price: number
    stock: number
    description: string
    image_url: string | null
}

type FormState = {
    name: string
    category: string
    price: string
    stock: string
    description: string
    image_url: string
}

const EMPTY: FormState = { name: '', category: CATEGORIES[0], price: '', stock: '', description: '', image_url: '' }

type Props = {
    initial: Product | null
    onSubmit: (data: ProductPayload) => Promise<void>
    onClose: () => void
}

// Modal form untuk Create & Update. Jika `initial` ada -> mode edit.
export default function ProductForm({ initial, onSubmit, onClose }: Props) {
    const [form, setForm] = useState<FormState>(
        initial
            ? {
                name: initial.name,
                category: initial.category,
                price: String(initial.price),
                stock: String(initial.stock),
                description: initial.description,
                image_url: initial.image_url,
            }
            : EMPTY,
    )
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
    const [saving, setSaving] = useState(false)
    const isEdit = Boolean(initial)

    const set =
        (key: keyof FormState) =>
            (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
                setForm((f) => ({ ...f, [key]: e.target.value }))

    const validate = () => {
        const err: Partial<Record<keyof FormState, string>> = {}
        if (!form.name.trim()) err.name = 'Nama roti wajib diisi'
        if (form.price === '' || Number(form.price) <= 0) err.price = 'Harga harus lebih dari 0'
        if (form.stock === '' || Number(form.stock) < 0) err.stock = 'Stok tidak boleh negatif'
        setErrors(err)
        return Object.keys(err).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return
        setSaving(true)
        await onSubmit({
            name: form.name.trim(),
            category: form.category,
            price: Number(form.price),
            stock: Number(form.stock),
            description: form.description.trim(),
            image_url: form.image_url || null,
        })
        setSaving(false)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/55 sm:items-center sm:p-4" onClick={onClose}>
            <form
                onSubmit={handleSubmit}
                onClick={(e) => e.stopPropagation()}
                className="fade-up max-h-[92vh] w-full max-w-lg space-y-4 overflow-y-auto border-2 border-ink bg-paper p-6 shadow-[6px_6px_0_#2a1c13]"
                style={{ borderRadius: 4 }}
            >
                <div className="flex items-center justify-between border-b border-line pb-3">
                    <h2 className="text-2xl">{isEdit ? 'Edit roti' : 'Tambah roti baru'}</h2>
                    <button type="button" onClick={onClose} aria-label="Tutup" className="p-1 hover:text-crust"><X size={22} /></button>
                </div>

                <ImageField value={form.image_url} onChange={(url) => setForm((f) => ({ ...f, image_url: url }))} />

                <label className="block">
                    <span className="label">Nama roti</span>
                    <input className="input" value={form.name} onChange={set('name')} placeholder="mis. Croissant Almond" />
                    {errors.name && <span className="text-sm text-brick">{errors.name}</span>}
                </label>

                <label className="block">
                    <span className="label">Kategori</span>
                    <select className="input" value={form.category} onChange={set('category')}>
                        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                </label>

                <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                        <span className="label">Harga (Rp)</span>
                        <input type="number" inputMode="numeric" className="input" value={form.price} onChange={set('price')} placeholder="18000" />
                        {errors.price && <span className="text-sm text-brick">{errors.price}</span>}
                    </label>
                    <label className="block">
                        <span className="label">Stok</span>
                        <input type="number" inputMode="numeric" className="input" value={form.stock} onChange={set('stock')} placeholder="20" />
                        {errors.stock && <span className="text-sm text-brick">{errors.stock}</span>}
                    </label>
                </div>

                <label className="block">
                    <span className="label">Deskripsi</span>
                    <textarea rows={3} className="input" value={form.description} onChange={set('description')} placeholder="Ceritakan singkat soal roti ini" />
                </label>

                <div className="flex gap-3 pt-1">
                    <button type="button" onClick={onClose} className="btn btn-ghost flex-1">Batal</button>
                    <button type="submit" disabled={saving} className="btn btn-primary flex-1">
                        {saving ? 'Menyimpan...' : isEdit ? 'Simpan perubahan' : 'Tambah'}
                    </button>
                </div>
            </form>
        </div>
    )
}