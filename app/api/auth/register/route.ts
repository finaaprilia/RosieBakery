import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { sql } from '@/lib/db'
import { createSession } from '@/lib/auth'

const schema = z.object({
    name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(80),
    email: z.string().trim().toLowerCase().email('Format email tidak valid'),
    password: z.string().min(8, 'Password minimal 8 karakter').max(72),
    phone: z.string().trim().max(20).optional(),
})

export async function POST(req: Request) {
    const parsed = schema.safeParse(await req.json().catch(() => null))
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { name, email, password, phone } = parsed.data

    const exists = await sql`SELECT 1 FROM users WHERE email = ${email}`
    if (exists.length > 0) {
        return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 409 })
    }

    const hash = await bcrypt.hash(password, 10)
    const rows = await sql`
    INSERT INTO users (name, email, password_hash, phone)
    VALUES (${name}, ${email}, ${hash}, ${phone ?? null})
    RETURNING id, name, email, role`

    await createSession(rows[0] as { id: number; name: string; email: string; role: 'customer' | 'admin' })
    return NextResponse.json({ ok: true })
}