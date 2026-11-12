import { neon } from '@neondatabase/serverless'
import type { CartLine, Order, Product } from './types'

// Gunakan connection string Neon yang berakhiran "-pooler"
export const sql = neon(process.env.DATABASE_URL!)

export async function getProducts(): Promise<Product[]> {
    const rows = await sql`
    SELECT id, name, category, price, stock,
           COALESCE(image_url, '') AS image_url, COALESCE(description, '') AS description
    FROM products ORDER BY created_at DESC, id DESC`
    return rows as Product[]
}

export async function getProduct(id: number): Promise<Product | null> {
    const rows = await sql`
    SELECT id, name, category, price, stock,
           COALESCE(image_url, '') AS image_url, COALESCE(description, '') AS description
    FROM products WHERE id = ${id}`
    return (rows[0] as Product) ?? null
}

export async function getCart(userId: number): Promise<CartLine[]> {
    const rows = await sql`
    SELECT c.qty, p.id, p.name, p.category, p.price, p.stock,
           COALESCE(p.image_url, '') AS image_url, COALESCE(p.description, '') AS description
    FROM cart_items c JOIN products p ON p.id = c.product_id
    WHERE c.user_id = ${userId}
    ORDER BY c.id`
    return rows.map((r) => ({
        // qty tidak boleh melebihi stok terbaru
        qty: Math.min(r.qty, Math.max(r.stock, 1)),
        product: {
            id: r.id, name: r.name, category: r.category, price: r.price, stock: r.stock,
            image_url: r.image_url, description: r.description,
        },
    }))
}

// Riwayat pesanan. userId diisi -> milik user itu; kosong -> semua pesanan (admin).
export async function getOrders(userId?: number): Promise<Order[]> {
    const rows = await sql`
    SELECT o.id, o.customer_name, o.method, o.address, o.note, o.total, o.status,
           to_char(o.created_at AT TIME ZONE 'Asia/Jakarta', 'DD Mon YYYY, HH24:MI') AS created_label,
           u.email AS user_email,
           COALESCE(
             json_agg(json_build_object('name', oi.name_snapshot, 'qty', oi.qty, 'price', oi.price_snapshot)
                      ORDER BY oi.id) FILTER (WHERE oi.id IS NOT NULL),
             '[]'::json) AS items
    FROM orders o
    JOIN users u ON u.id = o.user_id
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE (${userId ?? null}::int IS NULL OR o.user_id = ${userId ?? null}::int)
    GROUP BY o.id, u.email
    ORDER BY o.id DESC`
    return rows as Order[]
}