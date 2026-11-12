export default function ConfirmModal({ title, message, confirmLabel = 'Ya, hapus', onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/55 p-4" onClick={onCancel}>
            <div onClick={(e) => e.stopPropagation()} className="fade-up w-full max-w-sm border-2 border-ink bg-paper p-6 shadow-[6px_6px_0_#2a1c13]" style={{ borderRadius: 4 }}>
                <h2 className="text-xl">{title}</h2>
                <p className="mt-2 text-ink/70">{message}</p>
                <div className="mt-6 flex gap-3">
                    <button onClick={onCancel} className="btn btn-ghost flex-1">Batal</button>
                    <button onClick={onConfirm} className="btn flex-1 !border-brick !bg-brick text-white">{confirmLabel}</button>
                </div>
            </div>
        </div>
    )
}