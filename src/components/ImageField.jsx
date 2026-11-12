import { useRef, useState } from 'react'
import { ImagePlus, Link2, X } from 'lucide-react'
import uploadService from '../services/uploadService'

// Input foto roti: upload dari galeri/kamera, atau tempel link gambar.
export default function ImageField({ value, onChange }) {
    const fileRef = useRef(null)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')
    const [useUrl, setUseUrl] = useState(false)

    const handleFile = async (e) => {
        const file = e.target.files?.[0]
        e.target.value = '' // izinkan memilih file yang sama lagi
        if (!file) return
        setError('')
        setUploading(true)
        try {
            onChange(await uploadService.uploadImage(file))
        } catch (err) {
            setError(err.message || 'Gagal mengunggah gambar')
        }
        setUploading(false)
    }

    return (
        <div>
            <span className="label">Foto roti</span>

            <div className="photo relative aspect-[4/3] w-full">
                {value ? (
                    <img src={value} alt="Pratinjau foto roti" />
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-flour text-ink/50">
                        <ImagePlus size={30} />
                        <span className="hand text-lg">belum ada foto</span>
                    </div>
                )}
                {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-ink/55 font-bold text-paper">Mengunggah...</div>
                )}
                {value && !uploading && (
                    <button type="button" onClick={() => onChange('')} aria-label="Hapus foto" className="absolute right-2 top-2 border-[1.5px] border-ink bg-flour p-1" style={{ borderRadius: 3 }}>
                        <X size={16} />
                    </button>
                )}
            </div>

            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

            <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="btn btn-ghost !py-1.5 text-sm">
                    <ImagePlus size={15} /> {value ? 'Ganti foto' : 'Pilih foto'}
                </button>
                <button type="button" onClick={() => setUseUrl((v) => !v)} className="btn btn-ghost !py-1.5 text-sm">
                    <Link2 size={15} /> Pakai link
                </button>
            </div>

            {useUrl && (
                <input
                    className="input mt-2"
                    placeholder="https://... atau /roti/nama-file.jpg"
                    value={value && !value.startsWith('data:') ? value : ''}
                    onChange={(e) => onChange(e.target.value.trim())}
                />
            )}
            {error && <p className="mt-1 text-sm text-brick">{error}</p>}
        </div>
    )
}