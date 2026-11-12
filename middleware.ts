import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const SESSION_COOKIE = 'rosie_session' // harus sama dengan lib/auth.ts

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    let role: string | null = null
    const token = req.cookies.get(SESSION_COOKIE)?.value
    if (token) {
        try {
            const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET))
            role = String(payload.role)
        } catch {
            role = null
        }
    }

    const url = req.nextUrl.clone()

    // Sudah login -> tidak perlu ke halaman login / register
    if (pathname === '/login' || pathname === '/register') {
        if (!role) return NextResponse.next()
        url.pathname = '/'
        url.search = ''
        return NextResponse.redirect(url)
    }

    // Belum login -> ke halaman login
    if (!role) {
        url.pathname = '/login'
        url.search = `?next=${encodeURIComponent(pathname)}`
        return NextResponse.redirect(url)
    }

    // Bukan admin -> tidak boleh masuk /admin
    if (pathname.startsWith('/admin') && role !== 'admin') {
        url.pathname = '/'
        url.search = ''
        return NextResponse.redirect(url)
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/keranjang/:path*', '/profile/:path*', '/admin/:path*', '/login', '/register'],
}