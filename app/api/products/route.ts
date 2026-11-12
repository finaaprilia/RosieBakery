import { NextResponse } from 'next/server'
import { z } from 'zod'
import { sql, getProducts } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { CATEGORIES } from '@/lib/constants'

const productSchema = z.object({
    name: z.string().trim().min(1, 'Nama roti wajib diisi').max(100),
    category: z.enum(CATEGORIES),
    price: z.coerce.number().int().positive('Harga harus lebih dari 0'),
    stock: z.coerce.number().int().min(0, 'Stok tidak boleh negatif'),
    description: z.string().trim().max(1000).default(''),
    image_url: z.string().max(700_000).nullable().optional(),
})

const forbidden = () => NextResponse.json({ error: 'Khusus admin' }, { status: 403 })

// READ: publik
export async function GET() {
    return NextResponse.json({ products: await getProducts() })
}

// CREATE: admin
export async function POST(req: Request) {
    if (!(await requireAdmin())) return forbidden()
    const parsed = productSchema.safeParse(await req.json().catch(() => null))
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    const p = parsed.data

    const rows = await sql`
    INSERT INTO products (name, category, price, stock, description, image_url)
    VALUES (${p.name}, ${p.category}, ${p.price}, ${p.stock}, ${p.description}, ${p.image_url ?? null})
    RETURNING id`
    return NextResponse.json({ id: rows[0].id }, { status: 201 })
}

// UPDATE: admin (id dikirim di body)
export async function PATCH(req: Request) {
    if (!(await requireAdmin())) return forbidden()
    const parsed = productSchema.extend({ id: z.number().int() }).safeParse(await req.json().catch(() => null))
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    const p = parsed.data

    const rows = await sql`
    UPDATE products
    SET name = ${p.name}, category = ${p.category}, price = ${p.price}, stock = ${p.stock},
        description = ${p.description}, image_url = ${p.image_url ?? null}
    WHERE id = ${p.id}
    RETURNING id`
    if (rows.length === 0) return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })
    return NextResponse.json({ ok: true })
}

// DELETE: admin (?id=)
export async function DELETE(req: Request) {
    if (!(await requireAdmin())) return forbidden()
    const id = Number(new URL(req.url).searchParams.get('id'))
    if (!Number.isInteger(id)) return NextResponse.json({ error: 'id tidak valid' }, { status: 400 })

    await sql`DELETE FROM products WHERE id = ${id}`
    return NextResponse.json({ ok: true })
}