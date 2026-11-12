import { useState, useEffect } from 'react'

// Menangkap event "beforeinstallprompt" agar kita bisa membuat tombol Install sendiri.
export function useInstallPrompt() {
    const [promptEvent, setPromptEvent] = useState(null)

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault()
            setPromptEvent(e)
        }
        const installed = () => setPromptEvent(null)
        window.addEventListener('beforeinstallprompt', handler)
        window.addEventListener('appinstalled', installed)
        return () => {
            window.removeEventListener('beforeinstallprompt', handler)
            window.removeEventListener('appinstalled', installed)
        }
    }, [])

    const install = async () => {
        if (!promptEvent) return
        promptEvent.prompt()
        await promptEvent.userChoice
        setPromptEvent(null)
    }

    return { canInstall: Boolean(promptEvent), install }
}