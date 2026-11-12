import type { Metadata, Viewport } from 'next'
import { Young_Serif, Karla, Kalam } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CartProvider from '@/components/CartProvider'
import SplashGate from '@/components/SplashGate'
import { getSession } from '@/lib/auth'
import { getCart } from '@/lib/db'

const youngSerif = Young_Serif({ subsets: ['latin'], weight: '400', variable: '--font-young-serif', display: 'swap' })
const karla = Karla({ subsets: ['latin'], variable: '--font-karla', display: 'swap' })
const kalam = Kalam({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-kalam', display: 'swap' })

export const metadata: Metadata = {
    title: 'Rosie Bakery',
    description: 'Rosie Bakery - toko roti hangat dengan cinta.',
    icons: { icon: '/favicon.svg', apple: '/icons/icon-192.png' },
}

export const viewport: Viewport = {
    themeColor: '#b4532a',
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const user = await getSession()
    const lines = user ? await getCart(user.id) : []

    return (
        <html lang="id" className={`${youngSerif.variable} ${karla.variable} ${kalam.variable}`}>
            <body className="flex min-h-screen flex-col">
                {/* key: saat user berganti (login/logout), keranjang di-reset dari data server */}
                <CartProvider key={user?.id ?? 'guest'} user={user} initialLines={lines}>
                    <SplashGate />
                    <Navbar />
                    <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-20 pt-8 md:px-6 md:pb-14">{children}</main>
                    <Footer />
                </CartProvider>
            </body>
        </html>
    )
}