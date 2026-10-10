import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Lock } from 'lucide-react'
import AdminShell from '@/components/admin/AdminShell'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect('/login?callbackUrl=/admin')
    }

    const userRole = session.user.role?.toLowerCase()
    if (userRole !== 'admin' && userRole !== 'super_admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-md shadow-sm max-w-sm w-full text-center border border-gray-200">
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-5 h-5 text-red-500" />
                    </div>
                    <h1 className="text-lg font-semibold text-gray-900 mb-2">Accès Refusé</h1>
                    <p className="text-sm text-gray-500 mb-6">Vous n'avez pas les droits nécessaires.</p>
                    <Link href="/" className="inline-flex items-center justify-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors w-full">
                        Retour à l'accueil
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <AdminShell 
            user={{
                name: session.user.name,
                email: session.user.email,
                role: session.user.role
            }}
            appName={process.env.NEXT_PUBLIC_APP_NAME || 'Carriey'}
        >
            {children}
        </AdminShell>
    )
}
