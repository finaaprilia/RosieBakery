import { getProducts } from '@/lib/db'
import AdminProducts from './AdminProducts'

export default async function AdminProductsPage() {
    const products = await getProducts()
    return <AdminProducts products={products} />
}