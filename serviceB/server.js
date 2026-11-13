const express = require('express')
const Database = require('better-sqlite3')

const PORT = process.env.PORT || 4000
const SERVICE_A_URL = process.env.SERVICE_A_URL
const API_KEY = process.env.SERVICE_API_KEY

const db = new Database('reports.db')
db.exec(`
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    period_type TEXT NOT NULL CHECK (period_type IN ('daily','monthly')),
    period_label TEXT NOT NULL,
    total_orders INTEGER NOT NULL,
    total_revenue INTEGER NOT NULL,
    top_products TEXT NOT NULL,
    notes TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`)

const app = express()
app.use(express.json())

// Panggilan ke Service A
async function callA(path) {
    const res = await fetch(SERVICE_A_URL + path, { headers: { 'x-api-key': API_KEY } })
    if (!res.ok) throw new Error(`Service A membalas ${res.status}`)
    return res.json()
}

const parse = (r) => (r ? { ...r, top_products: JSON.parse(r.top_products) } : r)

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'rosie-report-service' }))

// POST /reports/generate  { period_type, period_label }
app.post('/reports/generate', async (req, res) => {
    const { period_type, period_label } = req.body || {}
    const valid =
        (period_type === 'daily' && /^\d{4}-\d{2}-\d{2}$/.test(period_label)) ||
        (period_type === 'monthly' && /^\d{4}-\d{2}$/.test(period_label))
    if (!valid) {
        return res.status(400).json({ error: 'period_type daily (YYYY-MM-DD) atau monthly (YYYY-MM)' })
    }

    try {
        const { orders } = await callA('/api/orders')
        const inPeriod = orders.filter(
            (o) => o.status !== 'dibatalkan' && (o.created_date || '').startsWith(period_label),
        )

        const totalRevenue = inPeriod.reduce((s, o) => s + o.total, 0)
        const sold = {}
        for (const o of inPeriod) for (const it of o.items) sold[it.name] = (sold[it.name] || 0) + it.qty
        const top = Object.entries(sold)
            .map(([name, qty]) => ({ name, qty }))
            .sort((a, b) => b.qty - a.qty)
            .slice(0, 5)

        const title = `Laporan ${period_type === 'daily' ? 'Harian' : 'Bulanan'} ${period_label}`
        const info = db
            .prepare(`INSERT INTO reports (title, period_type, period_label, total_orders, total_revenue, top_products)
                VALUES (?, ?, ?, ?, ?, ?)`)
            .run(title, period_type, period_label, inPeriod.length, totalRevenue, JSON.stringify(top))

        const row = db.prepare('SELECT * FROM reports WHERE id = ?').get(info.lastInsertRowid)
        res.status(201).json(parse(row))
    } catch (e) {
        res.status(502).json({ error: 'Gagal menghubungi Service A', detail: e.message })
    }
})

// GET /reports/low-stock  (harus di atas /reports/:id)
app.get('/reports/low-stock', async (req, res) => {
    try {
        const { products } = await callA('/api/products')
        res.json({ threshold: 5, products: products.filter((p) => p.stock <= 5) })
    } catch (e) {
        res.status(502).json({ error: 'Gagal menghubungi Service A', detail: e.message })
    }
})

// GET /reports?period_type=
app.get('/reports', (req, res) => {
    const { period_type } = req.query
    const rows = period_type
        ? db.prepare('SELECT * FROM reports WHERE period_type = ? ORDER BY id DESC').all(period_type)
        : db.prepare('SELECT * FROM reports ORDER BY id DESC').all()
    res.json({ reports: rows.map(parse) })
})

app.get('/reports/:id', (req, res) => {
    const row = db.prepare('SELECT * FROM reports WHERE id = ?').get(req.params.id)
    if (!row) return res.status(404).json({ error: 'Laporan tidak ditemukan' })
    res.json(parse(row))
})

// PUT /reports/:id  { title, notes }
app.put('/reports/:id', (req, res) => {
    const { title, notes } = req.body || {}
    if (!title || typeof title !== 'string') return res.status(400).json({ error: 'title wajib diisi' })
    const info = db.prepare('UPDATE reports SET title = ?, notes = ? WHERE id = ?').run(title, notes ?? '', req.params.id)
    if (info.changes === 0) return res.status(404).json({ error: 'Laporan tidak ditemukan' })
    res.json(parse(db.prepare('SELECT * FROM reports WHERE id = ?').get(req.params.id)))
})

app.delete('/reports/:id', (req, res) => {
    const info = db.prepare('DELETE FROM reports WHERE id = ?').run(req.params.id)
    if (info.changes === 0) return res.status(404).json({ error: 'Laporan tidak ditemukan' })
    res.json({ ok: true })
})

app.listen(PORT, () => console.log(`Service B jalan di http://localhost:${PORT}`))