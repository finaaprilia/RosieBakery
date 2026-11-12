import { NextResponse } from 'next/server'
import { z } from 'zod'
import { sql, getCart } from '@/lib/db'
import { getSession } from '@/lib/auth'

const unauthorized = () => NextResponse.json({ error: 'Silakan login dulu' }, { status: 401 })

// Ambil isi keranjang milik user yang sedang login
export async function GET() {
    const session = await getSession()
    if (!session) return unauthorized()
    return NextResponse.json({ lines: await getCart(session.id) })
}

const addSchema = z.object({
    productId: z.number().int(),
    qty: z.number().int().min(1).default(1),
})

// Tambah item (qty bertambah, dibatasi stok)
export async function POST(req: Request) {
    const session = await getSession()
    if (!session) return unauthorized()
    const parsed = addSchema.safeParse(await req.json().catch(() => null))
    if (!parsed.success) return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 })
    const { productId, qty } = parsed.data

    const [product] = await sql`SELECT stock FROM products WHERE id = ${productId}`
    if (!product) return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })

    const [current] = await sql`
    SELECT qty FROM cart_items WHERE user_id = ${session.id} AND product_id = ${productId}`
    const next = Math.min((current?.qty ?? 0) + qty, product.stock)
    if (next <= 0) return NextResponse.json({ error: 'Stok habis' }, { status: 400 })

    await sql`
    INSERT INTO cart_items (user_id, product_id, qty)
    VALUES (${session.id}, ${productId}, ${next})
    ON CONFLICT (user_id, product_id) DO UPDATE SET qty = ${next}`

    return NextResponse.json({ lines: await getCart(session.id) })
}

const setSchema = z.object({
    productId: z.number().int(),
    qty: z.number().int().min(0),
})

// Ubah jumlah (qty 0 = hapus item)
export async function PATCH(req: Request) {
    const session = await getSession()
    if (!session) return unauthorized()
    const parsed = setSchema.safeParse(await req.json().catch(() => null))
    if (!parsed.success) return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 })
    const { productId, qty } = parsed.data

    const [product] = await sql`SELECT stock FROM products WHERE id = ${productId}`
    const next = product ? Math.min(qty, product.stock) : 0

    if (next <= 0) {
        await sql`DELETE FROM cart_items WHERE user_id = ${session.id} AND product_id = ${productId}`
    } else {
        await sql`
      UPDATE cart_items SET qty = ${next}
      WHERE user_id = ${session.id} AND product_id = ${productId}`
    }
    return NextResponse.json({ lines: await getCart(session.id) })
}

// Hapus satu item (?productId=) atau kosongkan semua (tanpa parameter)
export async function DELETE(req: Request) {
    const session = await getSession()
    if (!session) return unauthorized()
    const raw = new URL(req.url).searchParams.get('productId')

    if (raw === null) {
        await sql`DELETE FROM cart_items WHERE user_id = ${session.id}`
    } else {
        await sql`DELETE FROM cart_items WHERE user_id = ${session.id} AND product_id = ${Number(raw)}`
    }
    return NextResponse.json({ lines: await getCart(session.id) })
}