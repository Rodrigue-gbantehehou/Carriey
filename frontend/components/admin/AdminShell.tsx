'use client'

import { useState } from 'react'
import Link from 'next/link'
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
    MessageSquare,
    Menu,
    X
} from 'lucide-react'

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

interface AdminShellProps {
    user: {
        name?: string | null
        email?: string | null
        role?: string | null
    }
    children: React.ReactNode
    appName: string
}

export default function AdminShell({ user, children, appName }: AdminShellProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const userRole = user.role?.toLowerCase()

    return (
        <div className="min-h-screen bg-gray-50 flex text-sm overflow-hidden">
            
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-gray-900/50 z-40 md:hidden" 
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Sidebar ── */}
            <aside 
                className={`w-64 bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Logo */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-900 rounded-md flex items-center justify-center">
                            <LayoutTemplate className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <div className="font-semibold text-gray-900 leading-none tracking-tight">{appName}</div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Admin</div>
                        </div>
                    </div>
                    <button 
                        className="md:hidden text-gray-500 hover:text-gray-900 p-1"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* User info */}
                <div className="px-6 py-4 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-medium text-sm border border-gray-200 shrink-0">
                            {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <div className="text-sm font-medium text-gray-900 truncate">{user.name || user.email?.split('@')[0]}</div>
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
                                            onClick={() => setSidebarOpen(false)}
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
            <main className="flex-1 md:ml-64 min-h-screen flex flex-col min-w-0 overflow-x-hidden">
                {/* Top bar */}
                <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 md:px-8 h-14 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <button 
                            className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-md"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="text-sm font-semibold text-gray-700 md:text-gray-500 md:font-normal">
                            Panel d'administration
                        </div>
                    </div>
                    <div className="flex items-center gap-3 hidden sm:flex">
                        <span className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-md border border-gray-200">
                            {user.email}
                        </span>
                    </div>
                </header>

                <div className="p-4 md:p-8 flex-1 overflow-x-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
