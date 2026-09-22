'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import config from '@/lib/config'
import { toast } from 'react-hot-toast'

interface DocItem {
    id: string
    title: string
    status: string
    doc_type: string
    user_id: string
    user_email: string | null
    user_name: string | null
    template_name: string | null
    linked_doc_id: string | null
    created_at: string
}

interface DocStats {
    total_cv: number
    total_cover_letters: number
    created_this_month: number
    cv_this_month: number
    letters_this_month: number
    by_template: { template: string; count: number }[]
    by_status: { draft: number; completed: number }
}

const DOC_TYPE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    cv: { label: 'CV', color: '#0369a1', bg: '#e0f2fe' },
    cover_letter: { label: 'Lettre', color: '#7c3aed', bg: '#ede9fe' },
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    draft: { label: 'Brouillon', color: '#92400e', bg: '#fef3c7' },
    completed: { label: 'Complété', color: '#065f46', bg: '#d1fae5' },
}

export default function AdminResumesPage() {
    const { data: session } = useSession()
    const [docs, setDocs] = useState<DocItem[]>([])
    const [stats, setStats] = useState<DocStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [selectedDoc, setSelectedDoc] = useState<DocItem | null>(null)
    const [detailLoading, setDetailLoading] = useState(false)
    const [docDetail, setDocDetail] = useState<any>(null)

    // Filtres
    const [filterType, setFilterType] = useState('')
    const [filterStatus, setFilterStatus] = useState('')
    const [filterSearch, setFilterSearch] = useState('')

    const headers = { Authorization: `Bearer ${session?.user?.accessToken}` }

    const fetchStats = useCallback(async () => {
        const r = await fetch(`${config.apiBaseUrl}/admin/resumes/stats`, { headers: { Authorization: `Bearer ${session?.user?.accessToken}` } })
        if (r.ok) setStats(await r.json())
    }, [session])

    const fetchDocs = useCallback(async () => {
        setLoading(true)
        const params = new URLSearchParams()
        if (filterType) params.set('doc_type', filterType)
        if (filterStatus) params.set('status', filterStatus)
        if (filterSearch) params.set('search', filterSearch)
        params.set('limit', '100')

        const r = await fetch(`${config.apiBaseUrl}/admin/resumes/?${params}`, { headers: { Authorization: `Bearer ${session?.user?.accessToken}` } })
        if (r.ok) setDocs(await r.json())
        setLoading(false)
    }, [session, filterType, filterStatus, filterSearch])

    useEffect(() => {
        if (!session?.user?.accessToken) return
        fetchStats()
        fetchDocs()
    }, [session, fetchStats, fetchDocs])

    const handleDelete = async (id: string) => {
        if (!confirm('Supprimer ce document définitivement ?')) return
        setDeletingId(id)
        try {
            const r = await fetch(`${config.apiBaseUrl}/admin/resumes/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
            })
            if (r.ok) {
                setDocs(d => d.filter(doc => doc.id !== id))
                toast.success('Document supprimé')
            }
        } catch { toast.error('Erreur lors de la suppression') }
        finally { setDeletingId(null) }
    }

    const handleViewDetail = async (doc: DocItem) => {
        setSelectedDoc(doc)
        setDetailLoading(true)
        setDocDetail(null)
        try {
            const r = await fetch(`${config.apiBaseUrl}/admin/resumes/${doc.id}`, {
                headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
            })
            if (r.ok) setDocDetail(await r.json())
        } catch { }
        finally { setDetailLoading(false) }
    }

    const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 mb-1">Documents</h1>
                <p className="text-gray-500 text-sm">CVs et lettres de motivation de tous les utilisateurs</p>
            </div>

            {/* Stats cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total CVs', value: stats.total_cv, icon: '📄', color: 'sky' },
                        { label: 'Lettres de motivation', value: stats.total_cover_letters, icon: '✉️', color: 'violet' },
                        { label: 'CVs ce mois', value: stats.cv_this_month, icon: '📅', color: 'emerald' },
                        { label: 'Lettres ce mois', value: stats.letters_this_month, icon: '🗓️', color: 'amber' },
                    ].map((s) => (
                        <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xl">{s.icon}</span>
                            </div>
                            <div className="text-3xl font-black text-gray-900">{s.value}</div>
                            <div className="text-xs font-semibold text-gray-500 mt-1">{s.label}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Filtres */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <div className="flex flex-wrap gap-3">
                    <input
                        type="text"
                        placeholder="🔍 Rechercher par titre ou email..."
                        value={filterSearch}
                        onChange={e => setFilterSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && fetchDocs()}
                        className="flex-1 min-w-[200px] px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-emerald-400 font-medium"
                    />
                    <select
                        value={filterType}
                        onChange={e => setFilterType(e.target.value)}
                        className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none"
                    >
                        <option value="">Tous les types</option>
                        <option value="cv">CV</option>
                        <option value="cover_letter">Lettre de motivation</option>
                    </select>
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none"
                    >
                        <option value="">Tous les statuts</option>
                        <option value="draft">Brouillon</option>
                        <option value="completed">Complété</option>
                    </select>
                    <button
                        onClick={fetchDocs}
                        className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all"
                    >
                        Filtrer
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Type</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Titre</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Utilisateur</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Template</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Statut</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto" />
                                </td></tr>
                            ) : docs.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400 font-medium">Aucun document trouvé</td></tr>
                            ) : docs.map(doc => {
                                const type = DOC_TYPE_LABELS[doc.doc_type] || DOC_TYPE_LABELS.cv
                                const status = STATUS_LABELS[doc.status] || STATUS_LABELS.draft
                                return (
                                    <tr key={doc.id} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="inline-flex px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest"
                                                style={{ background: type.bg, color: type.color }}>
                                                {type.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900 text-sm max-w-[160px] truncate">{doc.title}</div>
                                            {doc.linked_doc_id && <div className="text-[10px] text-emerald-600 font-bold mt-0.5">🔗 Lié</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link href={`/admin/users/${doc.user_id}`}
                                                className="text-sm font-medium text-blue-600 hover:underline block truncate max-w-[140px]">
                                                {doc.user_email || doc.user_id}
                                            </Link>
                                            {doc.user_name && <div className="text-xs text-gray-400 truncate">{doc.user_name}</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-medium text-gray-600 max-w-[120px] truncate">
                                                {doc.template_name || '—'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex px-2 py-1 rounded text-[10px] font-black uppercase"
                                                style={{ background: status.bg, color: status.color }}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-400 whitespace-nowrap">{fmtDate(doc.created_at)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleViewDetail(doc)}
                                                    className="text-xs font-bold px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-all border border-gray-200"
                                                >
                                                    Voir
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(doc.id)}
                                                    disabled={deletingId === doc.id}
                                                    className="text-xs font-bold px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all border border-red-100 disabled:opacity-50"
                                                >
                                                    Supprimer
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                {docs.length > 0 && (
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 font-medium">
                        {docs.length} document{docs.length > 1 ? 's' : ''} affiché{docs.length > 1 ? 's' : ''}
                    </div>
                )}
            </div>

            {/* Modal de détail */}
            {selectedDoc && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedDoc(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div>
                                <h2 className="text-lg font-black text-gray-900">{selectedDoc.title}</h2>
                                <p className="text-sm text-gray-500">{selectedDoc.user_email}</p>
                            </div>
                            <button onClick={() => setSelectedDoc(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6">
                            {detailLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
                                </div>
                            ) : docDetail ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div><span className="text-gray-400">Type</span>
                                            <div className="font-bold text-gray-900">{docDetail.doc_type === 'cover_letter' ? 'Lettre de motivation' : 'CV'}</div>
                                        </div>
                                        <div><span className="text-gray-400">Statut</span>
                                            <div className="font-bold text-gray-900">{docDetail.status}</div>
                                        </div>
                                        <div><span className="text-gray-400">Template</span>
                                            <div className="font-bold text-gray-900">{docDetail.template_name || '—'}</div>
                                        </div>
                                        <div><span className="text-gray-400">Créé le</span>
                                            <div className="font-bold text-gray-900">{fmtDate(docDetail.created_at)}</div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Contenu JSON</div>
                                        <pre className="bg-gray-900 text-emerald-400 text-xs p-4 rounded-xl overflow-auto max-h-64 font-mono">
                                            {JSON.stringify(docDetail.content, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            ) : <p className="text-gray-400 text-sm">Impossible de charger le détail.</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
