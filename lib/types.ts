import type { ORDER_STATUSES } from './constants'

export type Product = {
    id: number
    name: string
    category: string
    price: number
    stock: number
    image_url: string
    description: string
}

export type CartLine = { qty: number; product: Product }

export type SessionUser = {
    id: number
    name: string
    email: string
    role: 'customer' | 'admin'
}

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export type OrderItem = { name: string; qty: number; price: number }

export type Order = {
    id: number
    customer_name: string
    method: 'ambil' | 'antar'
    address: string | null
    note: string | null
    total: number
    status: OrderStatus
    created_label: string
    items: OrderItem[]
    user_email?: string
}