import { useState } from 'react'
import { Database, Play } from 'lucide-react'

const PROFILE = {
    nama: 'Rosita Dwi Ahyani',
    nim: '21120124120043',
    kelompok: '37',
}

export default function Profile({ onSeed, onReplaySplash }) {
    const [busy, setBusy] = useState(false)
    const [msg, setMsg] = useState('')

    const handleSeed = async () => {
        if (!confirm('Tambahkan 8 data contoh ke database Supabase?')) return
        setBusy(true)
        try {
            await onSeed()
            setMsg('Data contoh berhasil ditambahkan.')
        } catch (err) {
            setMsg(`Gagal: ${err.message}`)
        }
        setBusy(false)
    }

    const rows = [
        ['Nama', PROFILE.nama],
        ['NIM', PROFILE.nim],
        ['Kelompok', PROFILE.kelompok],
    ]

    return (
        <div className="mx-auto max-w-xl space-y-10">
            <section className="fade-up relative">
                <span className="tape -top-3 left-8 rotate-[-4deg]" />
                <div className="border-2 border-ink bg-flour shadow-[6px_6px_0_#d8b98a]" style={{ borderRadius: 4 }}>
                    <div className="flex items-center gap-4 border-b-2 border-ink bg-crust p-5 text-paper">
                        <div className="font-display flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-paper text-2xl">RD</div>
                        <div>
                            <p className="hand text-lg leading-none text-kraft">yang punya dapur</p>
                            <h1 className="text-2xl leading-tight">{PROFILE.nama}</h1>
                            <p className="text-paper/80">Pemilik Rosie Bakery</p>
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
            </section>
        </div>
    )
}