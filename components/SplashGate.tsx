'use client'

import { useState } from 'react'
import SplashScreen from './SplashScreen'

// Menampilkan animasi pembuka sekali saat situs pertama kali dibuka
export default function SplashGate() {
    const [show, setShow] = useState(true)
    return show ? <SplashScreen onFinish={() => setShow(false)} /> : null
}