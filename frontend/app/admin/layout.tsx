import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { headers } from 'next/headers'
import config from '@/lib/config'

// Sidebar nav items
const navSections = [
    {
        title: 'Général',
        items: [
            { label: 'Vue d\'ensemble', href: '/admin', icon: '📊', exact: true },
        ]
    },
    {
        title: 'Contenu',
        items: [
            { label: 'Documents', href: '/admin/resumes', icon: '📄' },
            { label: 'Modèles', href: '/admin/templates', icon: '🎨' },
        ]
    },
    {
        title: 'Communauté',
        items: [
            { label: 'Utilisateurs', href: '/admin/users', icon: '👥' },
            { label: 'Paiements', href: '/admin/payments', icon: '💳' },
        ]
    },
    {
        title: 'Outils',
        items: [
            { label: 'Rapports', href: '/admin/reports', icon: '📈' },
            { label: 'Logs Système', href: '/admin/audit', icon: '🔍' },
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
                <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-3xl">🔒</span>
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 mb-2">Accès Refusé</h1>
                    <p className="text-gray-500 mb-6">Vous n&apos;avez pas les droits nécessaires.</p>
                    <Link href="/" className="inline-block px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all">
                        Retour à l&apos;accueil
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* ── Sidebar ── */}
            <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shadow-sm fixed inset-y-0 left-0 z-30">
                {/* Logo */}
                <div className="px-6 py-5 border-b border-gray-100">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-md">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <div className="font-black text-gray-900 text-lg leading-none">CVtor</div>
                            <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Admin</div>
                        </div>
                    </Link>
                </div>

                {/* User info */}
                <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700 font-black text-sm">
                            {session.user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <div className="text-xs font-bold text-gray-700 truncate">{session.user.name || session.user.email?.split('@')[0]}</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">{userRole?.replace('_', ' ')}</div>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
                    {navSections.map((section) => (
                        <div key={section.title}>
                            <div className="px-3 mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                {section.title}
                            </div>
                            <ul className="space-y-0.5">
                                {section.items.map((item) => (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-600 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all group"
                                        >
                                            <span className="text-base">{item.icon}</span>
                                            <span>{item.label}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* Footer */}
                <div className="px-3 py-4 border-t border-gray-100 space-y-1">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-500 rounded-xl hover:bg-gray-50 hover:text-gray-700 transition-all"
                    >
                        <span>🌐</span>
                        <span>Voir le site</span>
                    </Link>
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-500 rounded-xl hover:bg-gray-50 hover:text-gray-700 transition-all"
                    >
                        <span>👤</span>
                        <span>Mon espace</span>
                    </Link>
                </div>
            </aside>

            {/* ── Main content ── */}
            <main className="flex-1 ml-64 min-h-screen">
                {/* Top bar */}
                <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-gray-100 px-8 h-16 flex items-center justify-between">
                    <div className="text-sm text-gray-400 font-medium">
                        Panel d&apos;administration
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                            {session.user.email}
                        </span>
                    </div>
                </header>

                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
