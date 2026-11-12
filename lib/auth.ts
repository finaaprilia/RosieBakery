import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { sql } from './db'
import type { SessionUser } from './types'

export const SESSION_COOKIE = 'rosie_session'
const MAX_AGE = 60 * 60 * 24 * 7 // 7 hari

function secret() {
    const s = process.env.AUTH_SECRET
    if (!s || s.length < 32) throw new Error('AUTH_SECRET belum diisi atau kurang dari 32 karakter')
    return new TextEncoder().encode(s)
}

export async function createSession(user: SessionUser) {
    const token = await new SignJWT({ name: user.name, email: user.email, role: user.role })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(String(user.id))
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(secret())

    const store = await cookies()
    store.set(SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: MAX_AGE,
    })
}

export async function destroySession() {
    const store = await cookies()
    store.delete(SESSION_COOKIE)
}

// Membaca sesi dari cookie (tanpa query database)
export async function getSession(): Promise<SessionUser | null> {
    const store = await cookies()
    const token = store.get(SESSION_COOKIE)?.value
    if (!token) return null
    try {
        const { payload } = await jwtVerify(token, secret())
        return {
            id: Number(payload.sub),
            name: String(payload.name),
            email: String(payload.email),
            role: payload.role === 'admin' ? 'admin' : 'customer',
        }
    } catch {
        return null
    }
}

// Untuk API admin: cek role langsung ke database, bukan dari token
export async function requireAdmin(): Promise<SessionUser | null> {
    const session = await getSession()
    if (!session) return null
    const rows = await sql`SELECT role FROM users WHERE id = ${session.id}`
    return rows[0]?.role === 'admin' ? session : null
}