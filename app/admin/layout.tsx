import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import AdminTabs from './AdminTabs'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const user = await getSession()
    if (!user) redirect('/login?next=/admin')
    if (user.role !== 'admin') redirect('/')

    return (
        <div className="space-y-6">
            <div className="border-b border-line pb-3">
                <p className="hand text-lg text-crust">ruang kerja dapur</p>
                <h1 className="text-4xl">Panel admin</h1>
            </div>
            <AdminTabs />
            {children}
        </div>
    )
}