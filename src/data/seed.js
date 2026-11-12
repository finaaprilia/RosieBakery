export const CATEGORIES = ['Roti Manis', 'Roti Tawar', 'Pastry', 'Kue', 'Minuman']

// Nomor WhatsApp toko (format internasional tanpa +) untuk checkout
export const WA_NUMBER = '6282134904910'

// Data contoh: dikirim ke Supabase lewat tombol "Isi data contoh" di halaman Profil.
// Foto disimpan di folder public/roti/ (lihat panduan untuk nama file).
export const seedProducts = [
    { name: 'Croissant Butter', category: 'Pastry', price: 18000, stock: 24, image_url: '/roti/croissant.jpg', description: 'Berlapis tipis dan renyah, dipanggang dengan butter yang harum. Paling enak selagi hangat.', favorite: true },
    { name: 'Roti Tawar Gandum', category: 'Roti Tawar', price: 25000, stock: 12, image_url: '/roti/roti-tawar-gandum.jpg', description: 'Lembut, padat serat, cocok untuk sarapan atau isian sandwich.', favorite: false },
    { name: 'Baguette Klasik', category: 'Roti Tawar', price: 22000, stock: 9, image_url: '/roti/baguette.jpg', description: 'Kulit garing, dalamnya empuk. Dipanggang setiap pagi.', favorite: false },
    { name: 'Donat Cokelat', category: 'Roti Manis', price: 8000, stock: 40, image_url: '/roti/donat-cokelat.jpg', description: 'Donat kentang yang empuk dengan lapisan cokelat tebal.', favorite: true },
    { name: 'Cupcake Vanilla', category: 'Kue', price: 15000, stock: 18, image_url: '/roti/cupcake-vanilla.jpg', description: 'Cupcake lembut dengan buttercream vanilla yang tidak terlalu manis.', favorite: false },
    { name: 'Cheesecake Slice', category: 'Kue', price: 32000, stock: 3, image_url: '/roti/cheesecake.jpg', description: 'Cheesecake creamy dengan dasar biskuit mentega.', favorite: true },
    { name: 'Cookies Choco Chip', category: 'Kue', price: 12000, stock: 30, image_url: '/roti/cookies-choco-chip.jpg', description: 'Renyah di tepi, chewy di tengah, penuh keping cokelat.', favorite: false },
    { name: 'Latte Hangat', category: 'Minuman', price: 24000, stock: 50, image_url: '/roti/latte.jpg', description: 'Espresso dan susu steamed. Teman terbaik untuk roti pagi.', favorite: false },
]