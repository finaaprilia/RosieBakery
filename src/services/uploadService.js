import axios from 'axios'
import { BASE_URL, SUPABASE_KEY } from '../config/api'

const BUCKET = 'product-images'
const MAX_SIDE = 900 // sisi terpanjang foto (px) setelah dikecilkan

// Kecilkan foto di browser agar ringan (JPEG, kualitas 0.82)
function compressImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image()
        const url = URL.createObjectURL(file)
        img.onload = () => {
            const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height))
            const canvas = document.createElement('canvas')
            canvas.width = Math.round(img.width * scale)
            canvas.height = Math.round(img.height * scale)
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
            URL.revokeObjectURL(url)
            canvas.toBlob(
                (blob) => (blob ? resolve(blob) : reject(new Error('Gagal memproses gambar'))),
                'image/jpeg',
                0.82,
            )
        }
        img.onerror = () => {
            URL.revokeObjectURL(url)
            reject(new Error('File bukan gambar yang valid'))
        }
        img.src = url
    })
}

const blobToDataUrl = (blob) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => reject(new Error('Gagal membaca gambar'))
        reader.readAsDataURL(blob)
    })

const uploadService = {
    /**
     * Upload foto roti. Urutan:
     * 1) Supabase Storage (bucket "product-images", public) -> mengembalikan URL publik
     * 2) Jika bucket belum disiapkan / offline -> dikembalikan sebagai data URL (base64)
     *    sehingga fitur ganti foto tetap bekerja.
     */
    async uploadImage(file) {
        if (!file.type.startsWith('image/')) throw new Error('Pilih file gambar (JPG/PNG/WebP)')
        const blob = await compressImage(file)

        if (BASE_URL && SUPABASE_KEY) {
            try {
                const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`
                await axios.post(`${BASE_URL}/storage/v1/object/${BUCKET}/${name}`, blob, {
                    headers: {
                        apikey: SUPABASE_KEY,
                        Authorization: `Bearer ${SUPABASE_KEY}`,
                        'Content-Type': 'image/jpeg',
                    },
                    timeout: 20000,
                })
                return `${BASE_URL}/storage/v1/object/public/${BUCKET}/${name}`
            } catch (err) {
                console.warn('Upload Storage gagal, memakai data URL:', err?.message)
            }
        }
        return blobToDataUrl(blob)
    },
}

export default uploadService