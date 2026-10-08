import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { headers } from 'next/headers'
import config from '@/lib/config'
import {
    LayoutDashboard,
    Files,
    LayoutTemplate,
    Users,
    CreditCard,
    LineChart,
    ShieldAlert,
    Globe,
    User,
    Lock,
    Settings,
    MessageSquare
} from 'lucide-react'

// Sidebar nav items
const navSections = [
    {
        title: 'Général',
        items: [
            { label: 'Vue d\'ensemble', href: '/admin', icon: LayoutDashboard, exact: true },
        ]
    },
    {
        title: 'Contenu',
        items: [
            { label: 'Documents', href: '/admin/resumes', icon: Files },
            { label: 'Modèles', href: '/admin/templates', icon: LayoutTemplate },
        ]
    },
    {
        title: 'Communauté',
        items: [
            { label: 'Utilisateurs', href: '/admin/users', icon: Users },
            { label: 'Paiements', href: '/admin/payments', icon: CreditCard },
            { label: 'Tarifs & Plans', href: '/admin/plans', icon: CreditCard },
            { label: 'Messages', href: '/admin/messages', icon: MessageSquare },
        ]
    },
    {
        title: 'Outils',
        items: [
            { label: 'Rapports & IA', href: '/admin/reports', icon: LineChart },
            { label: 'Logs Système', href: '/admin/audit', icon: ShieldAlert },
            { label: 'Configurations', href: '/admin/configs', icon: Settings },
        ]
    },
]

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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-md shadow-sm max-w-sm w-full text-center border border-gray-200">
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-5 h-5 text-red-500" />
                    </div>
                    <h1 className="text-lg font-semibold text-gray-900 mb-2">Accès Refusé</h1>
                    <p className="text-sm text-gray-500 mb-6">Vous n&apos;avez pas les droits nécessaires.</p>
                    <Link href="/" className="inline-flex items-center justify-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors w-full">
                        Retour à l&apos;accueil
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex text-sm">
            {/* ── Sidebar ── */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 left-0 z-30">
                {/* Logo */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-900 rounded-md flex items-center justify-center">
                        <LayoutTemplate className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900 leading-none tracking-tight">{process.env.NEXT_PUBLIC_APP_NAME || 'Carriey'}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Admin</div>
                    </div>
                </div>

                {/* User info */}
                <div className="px-6 py-4 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-medium text-sm border border-gray-200">
                            {session.user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <div className="text-sm font-medium text-gray-900 truncate">{session.user.name || session.user.email?.split('@')[0]}</div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest">{userRole?.replace('_', ' ')}</div>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
                    {navSections.map((section) => (
                        <div key={section.title}>
                            <div className="px-2 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                {section.title}
                            </div>
                            <ul className="space-y-1">
                                {section.items.map((item) => (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className="flex items-center gap-3 px-2 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
                                        >
                                            <item.icon className="w-4 h-4 text-gray-500" />
                                            <span>{item.label}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* Footer */}
                <div className="px-4 py-4 border-t border-gray-100 space-y-1">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-2 py-2 text-sm text-gray-500 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    >
                        <Globe className="w-4 h-4" />
                        <span>Voir le site</span>
                    </Link>
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-2 py-2 text-sm text-gray-500 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    >
                        <User className="w-4 h-4" />
                        <span>Mon espace</span>
                    </Link>
                </div>
            </aside>

            {/* ── Main content ── */}
            <main className="flex-1 ml-64 min-h-screen flex flex-col">
                {/* Top bar */}
                <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-8 h-14 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        Panel d&apos;administration
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-md border border-gray-200">
                            {session.user.email}
                        </span>
                    </div>
                </header>

                <div className="p-8 flex-1">
                    {children}
                </div>
            </main>
        </div>
    )
}
