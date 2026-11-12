export const rupiah = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

const MAX_SIDE = 700 // sisi terpanjang foto (px) setelah dikecilkan

// Kecilkan foto di browser lalu ubah jadi data URL (JPEG). Hanya dipakai di komponen client.
export function imageFileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) return reject(new Error('Pilih file gambar (JPG/PNG/WebP)'))
        const img = new Image()
        const url = URL.createObjectURL(file)
        img.onload = () => {
            const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height))
            const canvas = document.createElement('canvas')
            canvas.width = Math.round(img.width * scale)
            canvas.height = Math.round(img.height * scale)
            canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
            URL.revokeObjectURL(url)
            resolve(canvas.toDataURL('image/jpeg', 0.75))
        }
        img.onerror = () => {
            URL.revokeObjectURL(url)
            reject(new Error('File bukan gambar yang valid'))
        }
        img.src = url
    })
}

// Hanya izinkan redirect ke path internal (cegah open redirect)
export const safeNext = (next: string | null | undefined) =>
    next && next.startsWith('/') && !next.startsWith('//') ? next : '/'