'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import config from '@/lib/config'

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const Icons = {
    cart: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>,
    file: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    palette: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>,
    plus: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
    edit: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    trash: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
    check: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    template: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>,
    spark: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
    lock: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
    clock: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    home: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    grid: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    user: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    logout: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
    paper: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V9a2 2 0 012-2h2a2 2 0 012 2v9a2 2 0 01-2 2h-2z" /></svg>,
    attachment: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>,
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface Resume {
    id: string
    title: string
    template_id: string
    status: 'draft' | 'completed'
    created_at: string
    content?: any
}

interface Template {
    id: string
    slug: string
    name: string
    price: string
    currency: string
    is_active: boolean
    description?: string
}

interface TemplateAccess {
    id: string
    template_id: string
    template_name: string
    template_slug: string
    granted_at: string | null
    expires_at: string | null
    is_expired: boolean
    plan: 'trial' | 'permanent'
}

// ── Status badges ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    draft: { label: 'Brouillon', bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
    completed: { label: 'Complété', bg: '#D1FAE5', text: '#065F46', dot: '#10B981' },
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(dateString: string): string {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return 'À l\'instant'
    if (diffMin < 60) return `Il y a ${diffMin} min`
    const diffH = Math.floor(diffMin / 60)
    if (diffH < 24) return `Il y a ${diffH}h`
    const diffD = Math.floor(diffH / 24)
    if (diffD < 30) return `Il y a ${diffD}j`
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ══════════════════════════════════════════════════════════════════════════════
export default function DashboardPage() {
    const { data: session, status: sessionStatus } = useSession()
    const router = useRouter()

    const [resumes, setResumes] = useState<Resume[]>([])
    const [templates, setTemplates] = useState<Template[]>([])
    const [purchases, setPurchases] = useState<TemplateAccess[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'purchases' | 'resumes' | 'templates'>('purchases')

    // Redirect if not logged in
    useEffect(() => {
        if (sessionStatus === 'unauthenticated') {
            router.push('/login?callbackUrl=/dashboard')
        }
    }, [sessionStatus, router])

    // Fetch data
    useEffect(() => {
        if (!session?.user?.accessToken) return

        const fetchAll = async () => {
            setIsLoading(true)
            try {
                const headers = { Authorization: `Bearer ${session.user.accessToken}` }
                const [resumeRes, templateRes, purchaseRes] = await Promise.all([
                    fetch(`${config.apiBaseUrl}/resumes/`, { headers }),
                    fetch(`${config.apiBaseUrl}/templates`, { headers }),
                    fetch(`${config.apiBaseUrl}/templates/my-access`, { headers }),
                ])

                if (resumeRes.ok) setResumes(await resumeRes.json())
                if (templateRes.ok) setTemplates(await templateRes.json())
                if (purchaseRes.ok) setPurchases(await purchaseRes.json())
            } catch (e) {
                console.error('Dashboard fetch error:', e)
            } finally {
                setIsLoading(false)
            }
        }

        fetchAll()
    }, [session])

    // Delete resume
    const handleDelete = async (id: string) => {
        if (!session?.user?.accessToken) return
        try {
            const res = await fetch(`${config.apiBaseUrl}/resumes/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${session.user.accessToken}` },
            })
            if (res.ok) {
                setResumes(prev => prev.filter(r => r.id !== id))
            }
        } catch (e) {
            console.error('Delete error:', e)
        } finally {
            setDeleteId(null)
        }
    }

    // Loading state
    if (sessionStatus === 'loading' || isLoading) {
        return (
            <div style={{ minHeight: '100vh', background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 40, height: 40, border: '3px solid #00C896', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                    <p style={{ color: '#64748B', fontSize: 14 }}>Chargement de votre espace...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        )
    }

    const draftCount = resumes.filter(r => r.status === 'draft').length
    const completedCount = resumes.filter(r => r.status === 'completed').length
    const activePurchases = purchases.filter(p => !p.is_expired)

    const tabs = [
        { key: 'purchases' as const, label: 'Mes Achats', icon: Icons.cart, count: activePurchases.length },
        { key: 'resumes' as const, label: 'Mes CVs', icon: Icons.file, count: resumes.length },
        { key: 'templates' as const, label: 'Catalogue', icon: Icons.palette, count: templates.length },
    ]

    return (
        <div className="min-h-screen bg-brand-bg font-sans selection:bg-brand-cta selection:text-white overflow-x-hidden">
            {/* ── Navigation ── */}
            <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-black text-brand-text no-underline hover:opacity-80 transition-opacity">
                        CV<span className="text-brand-cta">tor</span>
                    </Link>
                    
                    <div className="flex items-center gap-2 sm:gap-4">
                        <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-xl text-brand-muted hover:text-brand-text hover:bg-gray-50 transition-all text-xs sm:text-sm font-semibold no-underline">
                            {Icons.home} <span className="hidden md:inline">Accueil</span>
                        </Link>
                        <Link href="/modeles" className="flex items-center gap-2 px-3 py-2 rounded-xl text-brand-muted hover:text-brand-text hover:bg-gray-50 transition-all text-xs sm:text-sm font-semibold no-underline">
                            {Icons.grid} <span className="hidden md:inline">Modèles</span>
                        </Link>
                        <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 text-brand-cta transition-all text-xs sm:text-sm font-bold no-underline shadow-sm border border-emerald-100">
                            {Icons.user} <span className="hidden sm:inline">Mon espace</span>
                        </Link>
                        
                        <div className="hidden xs:block w-px h-6 bg-gray-200 mx-1 sm:mx-2" />
                        
                        {/* Hidden on very small mobile, visible on xs and up */}
                        <div className="hidden sm:flex items-center gap-3 bg-gray-50 rounded-xl px-2 py-1.5 border border-gray-100">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-cta to-emerald-600 flex items-center justify-center text-white text-xs font-black shadow-inner">
                                {session?.user?.name?.charAt(0)?.toUpperCase() || session?.user?.email?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div className="hidden lg:block leading-tight pr-2">
                                <div className="text-xs font-bold text-brand-text truncate max-w-[120px]">{session?.user?.name || 'Utilisateur'}</div>
                                <div className="text-[10px] text-brand-muted truncate max-w-[120px]">{session?.user?.email}</div>
                            </div>
                        </div>

                        <button 
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="p-2 sm:px-3 sm:py-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all text-sm font-medium border-none bg-transparent cursor-pointer"
                            title="Déconnexion"
                        >
                            {Icons.logout}
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── Hero section ── */}
            <div className="bg-gradient-to-br from-brand-cta to-emerald-700 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                    <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-emerald-300 rounded-full blur-3xl" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 relative">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 lg:gap-12">
                        <div className="max-w-2xl">
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
                                Bonjour, {session?.user?.name?.split(' ')[0] || 'là'}
                            </h1>
                            <p className="text-white/80 text-base sm:text-lg font-medium max-w-xl">
                                Gérez vos candidatures, modifiez vos CVs et propulsez votre carrière avec nos meilleurs outils.
                            </p>
                        </div>
                        <Link
                            href="/modeles"
                            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-brand-cta rounded-2xl font-black text-base transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/10 no-underline whitespace-nowrap"
                        >
                            {Icons.plus} Créer un nouveau CV
                        </Link>
                    </div>

                </div>
            </div>

            {/* ── Main content ── */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
                
                {/* Custom Tabs */}
                <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 w-full lg:w-fit mb-10 overflow-x-auto no-scrollbar">
                    {tabs.map(({ key, label, icon, count }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`flex items-center justify-center gap-3 px-6 py-3 rounded-xl text-sm font-black transition-all whitespace-nowrap min-w-[120px] sm:min-w-0 flex-1 border-none cursor-pointer ${
                                activeTab === key 
                                ? 'bg-brand-cta text-white shadow-lg shadow-emerald-500/30' 
                                : 'text-brand-muted hover:text-brand-text hover:bg-gray-50 bg-transparent'
                            }`}
                        >
                            {icon}
                            <span className="hidden sm:inline">{label}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                activeTab === key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'
                            }`}>
                                {count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* ── Content Area ── */}
                <div className="min-h-[400px]">
                    {/* Purchases Tab content */}
                    {activeTab === 'purchases' && (
                        <div className="animate-fade-in">
                            {activePurchases.length === 0 ? (
                                <div className="text-center py-20 px-6 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm transition-all hover:shadow-md">
                                    <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-brand-cta">
                                        {Icons.cart}
                                    </div>
                                    <h3 className="text-2xl font-black text-brand-text mb-3">Aucun achat pour le moment</h3>
                                    <p className="text-brand-muted font-medium mb-10 max-w-md mx-auto">Explorez nos modèles premium et créez un CV professionnel qui impressionne les recruteurs.</p>
                                    <Link href="/modeles" className="inline-flex items-center gap-3 px-8 py-4 bg-brand-cta text-white rounded-2xl font-black no-underline hover:scale-105 transition-all shadow-xl shadow-emerald-500/20">
                                        {Icons.spark} Découvrir les modèles
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {activePurchases.map(purchase => (
                                        <div key={purchase.id} className="group bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-brand-cta/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-50 to-teal-100 rounded-2xl flex items-center justify-center text-brand-cta border border-emerald-100 group-hover:rotate-6 transition-transform">
                                                    {Icons.template}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-black text-brand-text mb-2 tracking-tight group-hover:text-brand-cta transition-colors">{purchase.template_name}</h3>
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                            purchase.plan === 'permanent' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                        }`}>
                                                            {purchase.plan === 'permanent' ? Icons.check : Icons.clock}
                                                            {purchase.plan === 'permanent' ? 'Permanent' : 'Essai'}
                                                        </span>
                                                        <span className="text-xs text-brand-muted font-bold">Acheté {timeAgo(purchase.granted_at || '')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Link href={`/editor?template=${purchase.template_slug}`} className="px-6 py-3 bg-brand-cta text-white rounded-xl font-black text-sm text-center no-underline hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20">
                                                Utiliser
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Resumes Tab content */}
                    {activeTab === 'resumes' && (
                        <div className="animate-fade-in">
                            {resumes.length === 0 ? (
                                <div className="text-center py-20 px-6 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
                                    <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-gray-400">
                                        {Icons.file}
                                    </div>
                                    <h3 className="text-2xl font-black text-brand-text mb-3">Aucun CV pour le moment</h3>
                                    <p className="text-brand-muted font-medium mb-10 max-w-md mx-auto">Choisissez un modèle et commencez à créer votre CV professionnel en quelques minutes.</p>
                                    <Link href="/modeles" className="inline-flex items-center gap-3 px-8 py-4 bg-brand-cta text-white rounded-2xl font-black no-underline shadow-xl shadow-emerald-500/20">
                                        {Icons.spark} Choisir un modèle
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {resumes.map(resume => {
                                        const st = STATUS_CONFIG[resume.status] || STATUS_CONFIG.draft
                                        const tpl = templates.find(t => t.id === resume.template_id)
                                        return (
                                            <div key={resume.id} className="group bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-center gap-5 flex-1 min-w-0">
                                                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-brand-bg transition-colors overflow-hidden border border-gray-100 shadow-inner relative">
                                                        {resume.content?.profile?.photo ? (
                                                            <Image 
                                                                src={resume.content.profile.photo} 
                                                                alt={resume.title} 
                                                                fill
                                                                className="object-cover" 
                                                            />
                                                        ) : (
                                                            Icons.file
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h3 className="text-base font-black text-brand-text truncate">{resume.title}</h3>
                                                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider" style={{ background: st.bg, color: st.text }}>
                                                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} />
                                                                {st.label}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-brand-muted font-bold">
                                                            <span>{tpl?.name || 'Modèle standard'}</span>
                                                            <span className="opacity-30">•</span>
                                                            <span>Créé {timeAgo(resume.created_at)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <Link href={`/editor?resume=${resume.id}`} className="flex-1 sm:flex-none px-6 py-2.5 bg-brand-cta/10 text-brand-cta rounded-xl font-black text-xs text-center no-underline hover:bg-brand-cta hover:text-white transition-all">
                                                        Modifier
                                                    </Link>
                                                    <button 
                                                        onClick={() => setDeleteId(resume.id)}
                                                        className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border-none bg-transparent cursor-pointer"
                                                        title="Supprimer"
                                                    >
                                                        {Icons.trash}
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Templates Tab content */}
                    {activeTab === 'templates' && (
                        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
                            {templates.filter(t => t.is_active).map(template => {
                                const isFree = parseFloat(template.price) === 0
                                const isPurchased = purchases.some(p => p.template_id === template.id && !p.is_expired)
                                return (
                                    <div key={template.id} className="group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl hover:border-brand-cta/30 transition-all flex flex-col">
                                        <div className="aspect-[4/5] bg-gray-50 relative flex items-center justify-center overflow-hidden">
                                            {/* Dummy template visual placeholder */}
                                            <div className="w-[70%] bg-white aspect-[1/1.414] shadow-2xl rounded-sm p-4 opacity-40 group-hover:scale-110 transition-transform duration-500">
                                                <div className="w-1/2 h-2 bg-gray-200 rounded-full mb-3" />
                                                <div className="w-3/4 h-1.5 bg-gray-100 rounded-full mb-8" />
                                                <div className="space-y-2">
                                                    <div className="w-full h-1 bg-gray-100 rounded-full" />
                                                    <div className="w-full h-1 bg-gray-100 rounded-full" />
                                                    <div className="w-2/3 h-1 bg-gray-100 rounded-full" />
                                                </div>
                                            </div>
                                            
                                            <div className="absolute inset-0 bg-brand-text/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-6 text-center">
                                                <Link href={`/editor?template=${template.slug}`} className="px-6 py-3 bg-brand-cta text-white font-black rounded-xl shadow-2xl transition-all hover:scale-105 active:scale-95 no-underline">
                                                    Choisir ce modèle
                                                </Link>
                                            </div>

                                            <div className="absolute top-4 right-4 z-10">
                                                {isPurchased ? (
                                                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                                        {Icons.check} Propriétaire
                                                    </span>
                                                ) : isFree ? (
                                                    <span className="inline-flex px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                                                        Gratuit
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex px-4 py-1.5 bg-brand-text text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                                        {template.price} {template.currency}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-6 flex flex-col flex-1">
                                            <h3 className="text-lg font-black text-brand-text mb-2 tracking-tight group-hover:text-brand-cta transition-colors truncate">{template.name}</h3>
                                            <p className="text-brand-muted text-xs font-medium mb-6 line-clamp-2 leading-relaxed h-8">
                                                {template.description || 'Design professionnel optimisé pour les systèmes ATS.'}
                                            </p>
                                            <Link 
                                                href={`/editor?template=${template.slug}`}
                                                className={`mt-auto w-full py-3.5 rounded-2xl font-black text-sm text-center no-underline transition-all active:scale-95 flex items-center justify-center gap-2 ${
                                                    isPurchased 
                                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 shadow-inner' 
                                                    : 'bg-gray-50 text-brand-text hover:bg-brand-cta hover:text-white hover:shadow-xl hover:shadow-emerald-500/20'
                                                }`}
                                            >
                                                {isPurchased ? <>{Icons.edit} Utiliser</> : isFree ? <>{Icons.spark} Utiliser gratuitement</> : <>{Icons.lock} Débloquer</>}
                                            </Link>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </main>

            {/* ── Delete Modal ── */}
            {deleteId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 overflow-hidden">
                    <div className="absolute inset-0 bg-brand-text/60 backdrop-blur-sm animate-fade-in" onClick={() => setDeleteId(null)} />
                    <div className="relative bg-white w-full max-w-sm rounded-3xl p-10 shadow-3xl text-center animate-slide-up">
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-bounce-slow">
                            {Icons.trash}
                        </div>
                        <h3 className="text-2xl font-black text-brand-text mb-3">Supprimer ce CV ?</h3>
                        <p className="text-brand-muted font-medium mb-10 leading-relaxed text-sm">Cette action est irréversible et supprimera définitivement le contenu de ce CV.</p>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="py-4 rounded-2xl bg-gray-50 text-brand-text font-black text-sm border-none cursor-pointer hover:bg-gray-100 transition-colors"
                            >
                                Garder
                            </button>
                            <button
                                onClick={() => handleDelete(deleteId)}
                                className="py-4 rounded-2xl bg-red-500 text-white font-black text-sm border-none cursor-pointer hover:bg-red-600 transition-all shadow-xl shadow-red-500/30"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Global animations helper */}
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                
                @keyframes spin { to { transform: rotate(360deg); } }
                .animate-spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    )
}
