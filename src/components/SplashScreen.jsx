import { useState, useEffect, useCallback, useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import './SplashScreen.css'

// Remah roti yang berhamburan saat roti "matang" (x/y = arah jatuh, d = jeda animasi)
const CRUMBS = [
    { x: '-150px', y: '120px', d: '0s', s: 9 },
    { x: '-90px', y: '170px', d: '0.05s', s: 6 },
    { x: '-40px', y: '140px', d: '0.1s', s: 8 },
    { x: '20px', y: '190px', d: '0s', s: 5 },
    { x: '70px', y: '150px', d: '0.08s', s: 9 },
    { x: '130px', y: '180px', d: '0.03s', s: 6 },
    { x: '170px', y: '110px', d: '0.12s', s: 7 },
    { x: '-120px', y: '60px', d: '0.06s', s: 5 },
    { x: '110px', y: '70px', d: '0.09s', s: 6 },
]

/**
 * SplashScreen - animasi pembuka Rosie Bakery.
 * - Roti meluncur dari kiri dengan jejak tepung keemasan
 * - Roti "matang": kilatan hangat, garis sayatan terbuka, remah berhamburan, uap naik
 * - Nama toko muncul perlahan
 * - Ketuk layar: roti mengembang. Tombol skip / Esc / Enter / Spasi: langsung masuk
 * - Otomatis memudar setelah `duration` ms
 */
export default function SplashScreen({ onFinish, duration = 5000 }) {
    const [isHit, setIsHit] = useState(false)
    const [isFading, setIsFading] = useState(false)
    const dismissedRef = useRef(false)

    const handleDismiss = useCallback(() => {
        if (dismissedRef.current) return
        dismissedRef.current = true
        setIsFading(true)
        setTimeout(() => onFinish && onFinish(), 600)
    }, [onFinish])

    // Ketuk layar -> roti mengembang
    const handleHit = (e) => {
        if (e.target.closest('.splash-skip-btn')) return
        setIsHit(false)
        requestAnimationFrame(() => requestAnimationFrame(() => setIsHit(true)))
    }

    useEffect(() => {
        const timer = setTimeout(handleDismiss, duration)
        const onKey = (e) => {
            if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') handleDismiss()
        }
        window.addEventListener('keydown', onKey)
        return () => {
            clearTimeout(timer)
            window.removeEventListener('keydown', onKey)
        }
    }, [duration, handleDismiss])

    return (
        <main
            className={`splash-overlay ${isHit ? 'hit' : ''} ${isFading ? 'splash-overlay--fading' : ''}`}
            onClick={handleHit}
            role="dialog"
            aria-modal="true"
            aria-label="Pembuka Rosie Bakery"
        >
            <div className="splash-trail" aria-hidden="true" />
            <div className="splash-flash" aria-hidden="true" />

            <div className="splash-stage">
                {/* Logo roti */}
                <svg className="splash-mark" viewBox="0 0 512 512" role="img" aria-label="Logo Rosie Bakery">
                    <path className="splash-steam s1" d="M200 120c-14-18 14-30 0-50" />
                    <path className="splash-steam s2" d="M256 112c-14-18 14-30 0-52" />
                    <path className="splash-steam s3" d="M312 120c-14-18 14-30 0-50" />
                    <path d="M96 300c0-86 70-150 160-150s160 64 160 150c0 20-14 34-34 34H130c-20 0-34-14-34-34z" fill="#fcd9a8" />
                    <path d="M96 300c0-86 70-150 160-150s160 64 160 150" fill="none" stroke="#e8a45c" strokeWidth="14" strokeLinecap="round" />
                    <path className="splash-score" d="M190 190l22 56" />
                    <path className="splash-score c2" d="M256 172v76" />
                    <path className="splash-score c3" d="M322 190l-22 56" />
                    <rect x="120" y="344" width="272" height="34" rx="6" fill="#f6efe4" />
                </svg>

                {/* Remah roti */}
                {CRUMBS.map((c, i) => (
                    <span
                        key={i}
                        className="splash-crumb"
                        style={{ '--x': c.x, '--y': c.y, width: c.s, height: c.s, animationDelay: `calc(2.45s + ${c.d})` }}
                        aria-hidden="true"
                    />
                ))}
            </div>

            <section className="splash-brand">
                <div className="splash-brand-name">Rosie Bakery</div>
                <div className="splash-brand-sub">Toko roti, dipanggang setiap pagi</div>
            </section>

            <button
                type="button"
                className="splash-skip-btn"
                onClick={(e) => {
                    e.stopPropagation()
                    handleDismiss()
                }}
                aria-label="Lewati pembuka"
            >
                <span>Masuk ke toko</span>
                <ArrowRight size={14} />
            </button>

            <span className="splash-hint">Ketuk layar untuk membuat rotinya mengembang</span>
        </main>
    )
}