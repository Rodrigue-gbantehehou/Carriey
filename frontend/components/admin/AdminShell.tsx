'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
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
    X,
    LogOut
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

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (sidebarOpen && window.innerWidth < 768) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [sidebarOpen]);

    const userName = user.name || user.email?.split('@')[0] || 'Admin';
    const initial = userName.charAt(0).toUpperCase();

    return (
        <div className="min-h-screen bg-background flex text-ui-sm overflow-hidden font-sans">
            
            {/* Mobile Sidebar Overlay */}
            <div 
                aria-hidden="true"
                onClick={() => setSidebarOpen(false)}
                className={`md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
                    sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            />

            {/* ── Sidebar ── */}
            <aside 
                className={`w-64 bg-background border-r border-border flex flex-col fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 shadow-2xl md:shadow-none ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Logo */}
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-primary rounded-panel flex items-center justify-center shadow-sm">
                            <LayoutTemplate className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <div className="font-bold text-text-primary text-ui-lg leading-none tracking-tight">{appName}</div>
                            <div className="text-[10px] text-primary uppercase tracking-widest mt-0.5 font-bold">Admin</div>
                        </div>
                    </div>
                    <button 
                        className="md:hidden p-1.5 rounded-lg text-text-muted hover:text-text-secondary hover:bg-background-subtle transition-all"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
                    {navSections.map((section) => (
                        <div key={section.title}>
                            <div className="px-3 mb-2 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                {section.title}
                            </div>
                            <ul className="space-y-0.5">
                                {section.items.map((item) => (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            onClick={() => setSidebarOpen(false)}
                                            className="flex items-center gap-3 px-3 py-2.5 text-ui-sm font-medium text-text-secondary rounded-panel hover:bg-background-subtle hover:text-text-primary transition-all group"
                                        >
                                            <item.icon className="w-4.5 h-4.5 text-text-muted group-hover:text-primary transition-colors flex-shrink-0" />
                                            <span>{item.label}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* Footer Links */}
                <div className="px-3 py-3 border-t border-border space-y-0.5 bg-background">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-3 py-2.5 text-ui-sm font-medium text-text-secondary rounded-panel hover:bg-background-subtle hover:text-text-primary transition-all group"
                    >
                        <Globe className="w-4 h-4 text-text-muted group-hover:text-primary" />
                        <span>Voir le site public</span>
                    </Link>
                    <Link
                        href="/accueil"
                        className="flex items-center gap-3 px-3 py-2.5 text-ui-sm font-medium text-text-secondary rounded-panel hover:bg-background-subtle hover:text-text-primary transition-all group"
                    >
                        <User className="w-4 h-4 text-text-muted group-hover:text-primary" />
                        <span>Espace utilisateur</span>
                    </Link>
                </div>

                {/* User info (Bottom) */}
                <div className="border-t border-border px-3 py-3 bg-background-subtle">
                    <div className="flex items-center gap-3 px-3 py-1">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-ui-xs font-bold text-white flex-shrink-0 shadow-sm">
                            {initial}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-ui-xs font-semibold text-text-primary truncate">{userName}</div>
                            <div className="text-[9px] text-text-muted uppercase tracking-widest font-bold">{userRole?.replace('_', ' ')}</div>
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="p-1.5 rounded-md text-text-muted hover:text-danger-text hover:bg-danger-bg transition-all"
                            title="Déconnexion"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* ── Main content ── */}
            <main className="flex-1 md:ml-64 min-h-screen flex flex-col min-w-0 overflow-x-hidden relative">
                {/* Top bar */}
                <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border px-4 md:px-8 h-14 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <button 
                            className="md:hidden p-1.5 -ml-1 rounded-lg text-text-secondary hover:text-primary hover:bg-primary-subtle transition-all"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="text-ui-sm font-bold text-text-primary tracking-tight">
                            Panel d'administration
                        </div>
                    </div>
                    <div className="flex items-center gap-3 hidden sm:flex">
                        <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider bg-background-subtle px-3 py-1.5 rounded-full border border-border shadow-sm">
                            {user.email}
                        </span>
                    </div>
                </header>

                <div className="p-4 md:p-8 flex-1 overflow-x-auto bg-background">
                    {children}
                </div>
            </main>
        </div>
    )
}
