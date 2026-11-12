import AuthForm from '@/components/AuthForm'

export const metadata = { title: 'Masuk — Rosie Bakery' }

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
    const { next } = await searchParams
    return <AuthForm mode="login" next={next} />
}