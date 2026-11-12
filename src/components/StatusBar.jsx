import { WifiOff, Download, RefreshCw, CloudOff } from 'lucide-react'

// Banner status koneksi & sinkronisasi data + tombol install PWA
export default function StatusBar({ online, canInstall, onInstall, syncStatus = 'synced', pendingCount = 0, onRetrySync }) {
    return (
        <>
            {/* Banner Offline */}
            {!online && (
                <div className="flex items-center justify-center gap-2 bg-ink px-4 py-2 text-sm text-paper text-center">
                    <WifiOff size={15} className="shrink-0" />
                    <span>
                        Kamu sedang offline.
                        {pendingCount > 0
                            ? ` Ada ${pendingCount} perubahan disimpan lokal (menunggu sinkronisasi).`
                            : ' Menu tetap bisa dilihat & diedit, checkout butuh internet.'}
                    </span>
                </div>
            )}

            {/* Banner Proses Sinkronisasi Otomatis saat Online */}
            {online && syncStatus === 'syncing' && (
                <div className="flex items-center justify-center gap-2 bg-crust px-4 py-1.5 text-xs font-bold text-paper text-center">
                    <RefreshCw size={13} className="animate-spin shrink-0" />
                    <span>Menyinkronkan {pendingCount > 0 ? `${pendingCount} ` : ''}perubahan lokal ke database...</span>
                </div>
            )}

            {/* Banner Ada Perubahan Tertunda / Gagal Terkirim saat Online */}
            {online && (syncStatus === 'pending' || syncStatus === 'error') && pendingCount > 0 && (
                <div className="flex items-center justify-between gap-3 bg-amber-900 px-4 py-1.5 text-xs font-bold text-paper">
                    <div className="flex items-center gap-2">
                        <CloudOff size={14} className="shrink-0" />
                        <span>Ada {pendingCount} perubahan lokal menunggu sinkronisasi ke server.</span>
                    </div>
                    {onRetrySync && (
                        <button onClick={onRetrySync} className="underline hover:text-white cursor-pointer">
                            Sinkronkan sekarang
                        </button>
                    )}
                </div>
            )}

            {/* Banner Pasang PWA */}
            {canInstall && (
                <div className="flex items-center justify-between gap-3 border-b border-line bg-flour px-4 py-2 text-sm">
                    <span>Pasang Rosie Bakery di perangkatmu supaya bisa dibuka seperti aplikasi biasa.</span>
                    <button onClick={onInstall} className="btn btn-primary !px-3 !py-1.5 text-sm">
                        <Download size={14} /> Install
                    </button>
                </div>
            )}
        </>
    )
}
