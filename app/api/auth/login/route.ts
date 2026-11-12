import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { sql } from '@/lib/db'
import { createSession } from '@/lib/auth'

const schema = z.object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(1),
})

export async function POST(req: Request) {
    const parsed = schema.safeParse(await req.json().catch(() => null))
    if (!parsed.success) {
        return NextResponse.json({ error: 'Email atau password tidak valid' }, { status: 400 })
    }
    const { email, password } = parsed.data

    const rows = await sql`SELECT id, name, email, role, password_hash FROM users WHERE email = ${email}`
    const user = rows[0]
    const ok = user ? await bcrypt.compare(password, user.password_hash) : false
    if (!user || !ok) {
        return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 })
    }

    await createSession({ id: user.id, name: user.name, email: user.email, role: user.role })
    return NextResponse.json({ ok: true, role: user.role })
}
