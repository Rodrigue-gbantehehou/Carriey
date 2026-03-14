'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import config from '@/lib/config'

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

// ── Status badges ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    draft: { label: 'Brouillon', bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-400' },
    completed: { label: 'Complété', bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
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
    const [isLoading, setIsLoading] = useState(true)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'resumes' | 'templates'>('resumes')

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
                const [resumeRes, templateRes] = await Promise.all([
                    fetch(`${config.apiBaseUrl}/resumes/`, {
                        headers: { Authorization: `Bearer ${session.user.accessToken}` },
                    }),
                    fetch(`${config.apiBaseUrl}/templates`, {
                        headers: { Authorization: `Bearer ${session.user.accessToken}` },
                    }),
                ])

                if (resumeRes.ok) {
                    const data = await resumeRes.json()
                    setResumes(data)
                }
                if (templateRes.ok) {
                    const data = await templateRes.json()
                    setTemplates(data)
                }
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
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400 text-sm">Chargement de votre espace...</p>
                </div>
            </div>
        )
    }

    const draftCount = resumes.filter(r => r.status === 'draft').length
    const completedCount = resumes.filter(r => r.status === 'completed').length

    return (
        <div className="min-h-screen bg-gray-950" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* ── Navigation ── */}
            <nav className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        CVtor
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/modeles" className="text-sm text-gray-400 hover:text-white transition-colors">
                            Modèles
                        </Link>
                        <Link href="/dashboard" className="text-sm font-semibold text-indigo-400">
                            Mon espace
                        </Link>
                        <div className="flex items-center gap-2 bg-gray-800 rounded-full px-3 py-1.5">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold">
                                {session?.user?.name?.charAt(0)?.toUpperCase() || session?.user?.email?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <span className="text-xs text-gray-300 hidden sm:inline">
                                {session?.user?.name || session?.user?.email}
                            </span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ── Hero section ── */}
            <div className="bg-gradient-to-br from-gray-900 via-indigo-950/40 to-gray-900 border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
                                Bonjour, {session?.user?.name?.split(' ')[0] || 'là'} 👋
                            </h1>
                            <p className="text-gray-400 text-sm sm:text-base">
                                Gérez vos CVs et explorez de nouveaux modèles.
                            </p>
                        </div>
                        <Link
                            href="/modeles"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-semibold text-sm transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Créer un nouveau CV
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-8">
                        {[
                            { label: 'Total CVs', value: resumes.length, icon: '📄', color: 'from-indigo-500/10 to-indigo-600/10 border-indigo-500/20' },
                            { label: 'Brouillons', value: draftCount, icon: '✏️', color: 'from-amber-500/10 to-amber-600/10 border-amber-500/20' },
                            { label: 'Complétés', value: completedCount, icon: '✅', color: 'from-emerald-500/10 to-emerald-600/10 border-emerald-500/20' },
                        ].map(({ label, value, icon, color }) => (
                            <div key={label} className={`bg-gradient-to-br ${color} border rounded-xl p-4`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg">{icon}</span>
                                    <span className="text-2xl font-bold text-white">{value}</span>
                                </div>
                                <p className="text-xs text-gray-400">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Main content ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

                {/* Tabs */}
                <div className="flex gap-1 bg-gray-900 rounded-xl p-1 mb-8 w-fit">
                    {([
                        { key: 'resumes', label: 'Mes CVs', icon: '📄', count: resumes.length },
                        { key: 'templates', label: 'Modèles disponibles', icon: '🎨', count: templates.length },
                    ] as const).map(({ key, label, icon, count }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === key
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                }`}
                        >
                            <span>{icon}</span>
                            {label}
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeTab === key ? 'bg-white/20' : 'bg-gray-800'
                                }`}>
                                {count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* ── Resumes Tab ── */}
                {activeTab === 'resumes' && (
                    <div>
                        {resumes.length === 0 ? (
                            <div className="text-center py-20 bg-gray-900/50 rounded-2xl border border-gray-800">
                                <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center text-3xl mx-auto mb-4">
                                    📝
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    Aucun CV pour le moment
                                </h3>
                                <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
                                    Choisissez un modèle et commencez à créer votre CV professionnel en quelques minutes.
                                </p>
                                <Link
                                    href="/modeles"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm transition-all"
                                >
                                    ✨ Choisir un modèle
                                </Link>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {resumes.map(resume => {
                                    const st = STATUS_CONFIG[resume.status] || STATUS_CONFIG.draft
                                    const tpl = templates.find(t => t.id === resume.template_id)

                                    return (
                                        <div
                                            key={resume.id}
                                            className="group bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                                    {/* Icon */}
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-xl shrink-0">
                                                        📄
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h3 className="font-semibold text-white truncate">{resume.title}</h3>
                                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${st.bg} ${st.text}`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                                                                {st.label}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                                            {tpl && (
                                                                <span className="flex items-center gap-1">
                                                                    <span className="w-3 h-3 rounded bg-indigo-500/30" />
                                                                    {tpl.name}
                                                                </span>
                                                            )}
                                                            <span>•</span>
                                                            <span>{timeAgo(resume.created_at)}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <Link
                                                        href={`/editor?resume=${resume.id}`}
                                                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Modifier
                                                    </Link>
                                                    <button
                                                        onClick={() => setDeleteId(resume.id)}
                                                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                        title="Supprimer"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Templates Tab ── */}
                {activeTab === 'templates' && (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {templates.filter(t => t.is_active).map(template => {
                            const isFree = parseFloat(template.price) === 0
                            return (
                                <div
                                    key={template.id}
                                    className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all"
                                >
                                    {/* Preview area */}
                                    <div className="aspect-[4/3] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
                                        <div className="w-2/3 space-y-2 opacity-20">
                                            <div className="h-3 bg-gray-600 rounded w-1/2 mx-auto" />
                                            <div className="h-2 bg-gray-700 rounded w-3/4 mx-auto" />
                                            <div className="h-px bg-gray-700 my-3" />
                                            <div className="h-2 bg-gray-700 rounded" />
                                            <div className="h-2 bg-gray-700 rounded w-5/6" />
                                        </div>
                                        {/* Badge prix */}
                                        <div className="absolute top-3 right-3">
                                            {isFree ? (
                                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500 text-white">
                                                    Gratuit
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                                                    {template.price} {template.currency}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <h3 className="font-semibold text-white mb-1">{template.name}</h3>
                                        <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                                            {template.description || 'Modèle de CV professionnel'}
                                        </p>
                                        <Link
                                            href={`/editor?template=${template.slug}`}
                                            className="block w-full text-center py-2.5 rounded-lg bg-gray-800 hover:bg-indigo-600 text-gray-300 hover:text-white text-xs font-semibold transition-all"
                                        >
                                            {isFree ? '✨ Utiliser ce modèle' : '🔓 Utiliser'}
                                        </Link>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* ── Delete confirmation modal ── */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-2xl mx-auto mb-4">
                            🗑️
                        </div>
                        <h3 className="text-lg font-bold text-white text-center mb-2">Supprimer ce CV ?</h3>
                        <p className="text-sm text-gray-400 text-center mb-6">
                            Cette action est irréversible. Le CV sera supprimé définitivement.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="flex-1 py-2.5 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 text-sm font-medium transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={() => handleDelete(deleteId)}
                                className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
