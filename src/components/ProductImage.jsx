import { useState } from 'react'

// Warna latar cadangan per kategori (dipakai jika foto belum ada / gagal dimuat)
const TILE = {
    'Roti Manis': '#e9c9a0',
    'Roti Tawar': '#d8c7a3',
    Pastry: '#e6b98a',
    Kue: '#e8cfc4',
    Minuman: '#c9c3a6',
}

// Menampilkan foto roti. Jika tidak ada / gagal dimuat -> kotak berwarna dengan huruf awal.
export default function ProductImage({ product, className = '', letterSize = 'text-6xl' }) {
    const [failed, setFailed] = useState(false)
    const src = product.image_url

    if (!src || failed) {
        return (
            <div
                className={`flex h-full w-full items-center justify-center ${className}`}
                style={{ background: TILE[product.category] || '#e9c9a0' }}
                aria-label={product.name}
            >
                <span className={`font-display select-none text-ink/25 ${letterSize}`}>{product.name.charAt(0)}</span>
            </div>
        )
    }

    return (
        <img
            src={src}
            alt={product.name}
            loading="lazy"
            onError={() => setFailed(true)}
            className={`h-full w-full object-cover ${className}`}
        />
    )
}