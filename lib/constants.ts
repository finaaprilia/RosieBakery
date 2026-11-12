export const CATEGORIES = ['Roti Manis', 'Roti Tawar', 'Pastry', 'Kue', 'Minuman'] as const

export const ORDER_STATUSES = ['pending', 'diproses', 'siap', 'selesai', 'dibatalkan'] as const

export const STATUS_LABEL: Record<(typeof ORDER_STATUSES)[number], string> = {
    pending: 'Menunggu konfirmasi',
    diproses: 'Sedang diproses',
    siap: 'Siap diambil / diantar',
    selesai: 'Selesai',
    dibatalkan: 'Dibatalkan',
}