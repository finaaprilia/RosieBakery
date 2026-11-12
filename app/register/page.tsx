import AuthForm from '@/components/AuthForm'

export const metadata = { title: 'Daftar — Rosie Bakery' }

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
    const { next } = await searchParams
    return <AuthForm mode="register" next={next} />
}