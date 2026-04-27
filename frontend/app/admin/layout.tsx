import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    
    console.log("[AdminLayout] Session check:", { 
        hasSession: !!session, 
        userEmail: session?.user?.email,
        role: session?.user?.role 
    })
    
    // Protect admin routes
    if (!session) {
        console.warn("[AdminLayout] No session found, redirecting to login...")
        redirect('/login?callbackUrl=/admin')
    }

    // Check role
    const userRole = session.user.role?.toLowerCase()
    if (userRole !== 'admin' && userRole !== 'super_admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Accès Refusé</h1>
                    <p className="mb-6">Vous n&apos;avez pas les droits nécessaires pour accéder à cette section.</p>
                    <Link href="/" className="text-blue-600 hover:underline">
                        Retour à l&apos;accueil
                    </Link>
                </div>
            </div>
        )
    }

    const navItems = [
        { label: 'Vue d\'ensemble', href: '/admin' },
        { label: 'Modèles de CV', href: '/admin/templates' },
        { label: 'Utilisateurs', href: '/admin/users' },
        { label: 'Paiements', href: '/admin/payments' },
        { label: 'Logs Système', href: '/admin/audit' },
    ]

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Admin CVTor</h2>
                    <p className="text-sm text-gray-500 mt-1">{session.user.email}</p>
                </div>
                <nav className="p-4">
                    <ul className="space-y-2">
                        {navItems.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="p-4 border-t mt-auto">
                    <Link href="/" className="block text-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border rounded hover:bg-gray-50">
                        Retour au site
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
