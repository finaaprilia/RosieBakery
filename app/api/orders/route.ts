import { NextResponse } from 'next/server'
import { z } from 'zod'
import { sql, getOrders } from '@/lib/db'
import { getSession, requireAdmin } from '@/lib/auth'
import { ORDER_STATUSES } from '@/lib/constants'

// Riwayat pesanan milik user yang sedang login
export async function GET(req: Request) {
    const key = req.headers.get('x-api-key')
    if (key && key === process.env.SERVICE_API_KEY) {
        return NextResponse.json({ orders: await getOrders() }) // semua pesanan, untuk Service B
    }

    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Silakan login dulu' }, { status: 401 })
    return NextResponse.json({ orders: await getOrders(session.id) })
}

const checkoutSchema = z
    .object({
        name: z.string().trim().min(1, 'Isi nama dulu supaya kami tahu siapa yang memesan').max(80),
        method: z.enum(['ambil', 'antar']),
        address: z.string().trim().max(300).optional(),
        note: z.string().trim().max(300).optional(),
    })
    .refine((d) => d.method !== 'antar' || !!d.address, {
        message: 'Alamat pengantaran wajib diisi',
        path: ['address'],
    })

// CHECKOUT: ubah isi keranjang menjadi pesanan (satu transaksi database)
export async function POST(req: Request) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Silakan login dulu' }, { status: 401 })

    const parsed = checkoutSchema.safeParse(await req.json().catch(() => null))
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    const { name, method, address, note } = parsed.data
    const uid = session.id

    const cart = await sql`SELECT 1 FROM cart_items WHERE user_id = ${uid} LIMIT 1`
    if (cart.length === 0) return NextResponse.json({ error: 'Keranjang masih kosong' }, { status: 400 })

    try {
        // Semua query di bawah berhasil bersama, atau batal bersama.
        // Jika stok kurang, CHECK (stock >= 0) menggagalkan UPDATE dan seluruh transaksi di-rollback.
        const results = await sql.transaction([
            sql`UPDATE products p SET stock = p.stock - c.qty
          FROM cart_items c WHERE c.product_id = p.id AND c.user_id = ${uid}`,
            sql`WITH new_order AS (
            INSERT INTO orders (user_id, customer_name, method, address, note, total)
            SELECT ${uid}::int, ${name}::text, ${method}::text, ${address ?? null}::text, ${note ?? null}::text,
                   SUM(c.qty * p.price)::int
            FROM cart_items c JOIN products p ON p.id = c.product_id
            WHERE c.user_id = ${uid}
            HAVING COUNT(*) > 0
            RETURNING id
          ), items AS (
            INSERT INTO order_items (order_id, product_id, name_snapshot, price_snapshot, qty)
            SELECT (SELECT id FROM new_order), p.id, p.name, p.price, c.qty
            FROM cart_items c JOIN products p ON p.id = c.product_id
            WHERE c.user_id = ${uid}
          )
          SELECT id FROM new_order`,
            sql`DELETE FROM cart_items WHERE user_id = ${uid}`,
        ])
        return NextResponse.json({ orderId: results[1][0].id }, { status: 201 })
    } catch (err) {
        if ((err as { code?: string }).code === '23514') {
            return NextResponse.json(
                { error: 'Stok ada yang tidak cukup. Periksa kembali jumlah di keranjang.' },
                { status: 409 },
            )
        }
        throw err
    }
}

const statusSchema = z.object({
    id: z.number().int(),
    status: z.enum(ORDER_STATUSES),
})

// UBAH STATUS: admin. Jika dibatalkan, stok dikembalikan.
export async function PATCH(req: Request) {
    if (!(await requireAdmin())) return NextResponse.json({ error: 'Khusus admin' }, { status: 403 })
    const parsed = statusSchema.safeParse(await req.json().catch(() => null))
    if (!parsed.success) return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 })
    const { id, status } = parsed.data

    const [order] = await sql`SELECT status FROM orders WHERE id = ${id}`
    if (!order) return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 })
    if (order.status === 'dibatalkan') {
        return NextResponse.json({ error: 'Pesanan yang sudah dibatalkan tidak bisa diubah' }, { status: 400 })
    }

    const queries = [sql`UPDATE orders SET status = ${status} WHERE id = ${id}`]
    if (status === 'dibatalkan') {
        queries.push(
            sql`UPDATE products p SET stock = p.stock + oi.qty
          FROM order_items oi WHERE oi.order_id = ${id} AND oi.product_id = p.id`,
        )
    }
    await sql.transaction(queries)
    return NextResponse.json({ ok: true })
}