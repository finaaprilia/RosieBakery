import { getProducts } from '@/lib/db'
import MenuBrowser from '@/components/MenuBrowser'

export const metadata = { title: 'Menu — Rosie Bakery' }

export default async function MenuPage() {
    const products = await getProducts()
    return <MenuBrowser products={products} />
}