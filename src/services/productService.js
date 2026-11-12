import { apiClient } from '../config/api'

// Service CRUD ke tabel `products` di Supabase (PostgREST)
const RETURN = { headers: { Prefer: 'return=representation' } }

const normalize = (row) => ({
  id: row.id,
  name: row.name,
  category: row.category,
  price: Number(row.price),
  stock: Number(row.stock),
  emoji: row.emoji || '🥐',
  image_url: row.image_url || '',
  description: row.description || '',
  favorite: Boolean(row.favorite),
})

const productService = {
  // READ ALL
  async getProducts() {
    const rows = await apiClient.get('/rest/v1/products?select=*&order=created_at.desc')
    return Array.isArray(rows) ? rows.map(normalize) : []
  },

  // READ BY ID
  async getProductById(id) {
    const rows = await apiClient.get(`/rest/v1/products?id=eq.${id}&select=*`)
    if (Array.isArray(rows) && rows.length > 0) {
      return normalize(rows[0])
    }
    throw new Error('Produk tidak ditemukan.')
  },

  // CREATE
  async createProduct(payload) {
    const rows = await apiClient.post('/rest/v1/products', payload, RETURN)
    const list = Array.isArray(rows) ? rows.map(normalize) : []
    return list[0] || null
  },

  // UPDATE
  async updateProduct(id, payload) {
    const rows = await apiClient.patch(`/rest/v1/products?id=eq.${id}`, payload, RETURN)
    return Array.isArray(rows) && rows[0] ? normalize(rows[0]) : null
  },

  // DELETE
  async deleteProduct(id) {
    await apiClient.delete(`/rest/v1/products?id=eq.${id}`)
    return true
  },

  // TOGGLE FAVORITE
  async toggleFavorite(id, newFavoriteStatus) {
    const rows = await apiClient.patch(`/rest/v1/products?id=eq.${id}`, { favorite: Boolean(newFavoriteStatus) }, RETURN)
    return Array.isArray(rows) && rows[0] ? normalize(rows[0]) : null
  },
}

export default productService
