import { WA_NUMBER } from './data/seed'

export const rupiah = (n) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

// Susun pesan pesanan lalu bungkus jadi link WhatsApp (wa.me)
export function buildWhatsAppLink({ lines, total, name, method, address, note }) {
    const items = lines
        .map((l, i) => `${i + 1}. ${l.product.name} x${l.qty} = ${rupiah(l.qty * l.product.price)}`)
        .join('\n')

    const text = [
        'Halo Rosie Bakery, saya mau pesan:',
        '',
        items,
        '',
        `Total: ${rupiah(total)}`,
        '',
        `Nama: ${name}`,
        `Pengambilan: ${method === 'antar' ? 'Diantar' : 'Ambil di toko'}`,
        method === 'antar' ? `Alamat: ${address}` : null,
        note ? `Catatan: ${note}` : null,
        '',
        'Terima kasih!',
    ]
        .filter((line) => line !== null)
        .join('\n')

    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`
}