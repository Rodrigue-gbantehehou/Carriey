'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import config from '@/lib/config'
import { toast } from 'react-hot-toast'

export default function AdminUserDetailPage() {
    const { data: session } = useSession()
    const { id } = useParams()
    const router = useRouter()
    
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Form states
    const [emailSubject, setEmailSubject] = useState('')
    const [emailMessage, setEmailMessage] = useState('')
    const [sendingEmail, setSendingEmail] = useState(false)

    const [newPassword, setNewPassword] = useState('')
    const [resettingPassword, setResettingPassword] = useState(false)

    const fetchUserDetail = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch(`${config.apiBaseUrl}/admin/users/${id}/details`, {
                headers: { 'Authorization': `Bearer ${session?.user?.accessToken}` }
            })
            if (!res.ok) throw new Error('Utilisateur non trouvé')
            setData(await res.json())
        } catch (err: any) {
            toast.error(err.message)
            router.push('/admin/users')
        } finally {
            setLoading(false)
        }
    }, [id, session, router])

    useEffect(() => {
        if (session?.user?.accessToken && id) {
            fetchUserDetail()
        }
    }, [session, id, fetchUserDetail])

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!emailSubject || !emailMessage) return toast.error('Veuillez remplir tous les champs')

        setSendingEmail(true)
        try {
            const res = await fetch(`${config.apiBaseUrl}/admin/users/${id}/send-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.user?.accessToken}`
                },
                body: JSON.stringify({ subject: emailSubject, message: emailMessage })
            })
            if (!res.ok) throw new Error('Erreur lors de l\'envoi de l\'email')
            
            toast.success('Email envoyé avec succès')
            setEmailSubject('')
            setEmailMessage('')
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setSendingEmail(false)
        }
    }

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword.length < 6) return toast.error('Le mot de passe doit faire au moins 6 caractères')

        setResettingPassword(true)
        try {
            const res = await fetch(`${config.apiBaseUrl}/admin/users/${id}/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.user?.accessToken}`
                },
                body: JSON.stringify({ new_password: newPassword })
            })
            if (!res.ok) throw new Error('Erreur lors de la réinitialisation du mot de passe')
            
            toast.success('Mot de passe réinitialisé')
            setNewPassword('')
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setResettingPassword(false)
        }
    }

    const handleToggleActive = async () => {
        if (!data?.user) return
        try {
            const res = await fetch(`${config.apiBaseUrl}/admin/users/${id}/toggle-active`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${session?.user?.accessToken}` }
            })
            if (!res.ok) throw new Error('Erreur')
            
            const updated = await res.json()
            setData({ ...data, user: { ...data.user, is_active: updated.is_active } })
            toast.success(`Utilisateur ${updated.is_active ? 'activé' : 'désactivé'}`)
        } catch (err: any) {
            toast.error(err.message)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        )
    }

    if (!data) return null

    const { user, stats, documents, payments } = data

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/admin/users" className="text-emerald-600 hover:underline text-sm mb-2 inline-block">
                        &larr; Retour aux utilisateurs
                    </Link>
                    <h1 className="text-3xl font-black text-gray-900 mb-1">{user.full_name || 'Utilisateur sans nom'}</h1>
                    <p className="text-gray-500 text-sm">{user.email}</p>
                </div>
                <div>
                    <span className={`inline-flex px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest ${
                        user.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                        {user.is_active ? 'Actif' : 'Désactivé'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'CV créés', value: stats.total_cv, icon: '📄' },
                    { label: 'Lettres créées', value: stats.total_letters, icon: '✉️' },
                    { label: 'Paiements effectués', value: stats.total_payments, icon: '💳' },
                    { label: 'Total dépensé', value: `${stats.total_paid} XOF`, icon: '💰' },
                ].map((s) => (
                    <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xl">{s.icon}</span>
                        </div>
                        <div className="text-2xl font-black text-gray-900">{s.value}</div>
                        <div className="text-xs font-semibold text-gray-500 mt-1">{s.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* ── Colonne Principale (Docs & Paiements) ── */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Documents */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-black text-gray-900 mb-4">Documents récents</h2>
                        {documents.length === 0 ? (
                            <p className="text-sm text-gray-500">Aucun document créé</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100 text-gray-400">
                                            <th className="pb-2 font-semibold">Titre</th>
                                            <th className="pb-2 font-semibold">Type</th>
                                            <th className="pb-2 font-semibold">Template</th>
                                            <th className="pb-2 font-semibold">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {documents.slice(0, 5).map((doc: any) => (
                                            <tr key={doc.id}>
                                                <td className="py-3 font-medium text-gray-900">{doc.title}</td>
                                                <td className="py-3">
                                                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                        doc.doc_type === 'cv' ? 'bg-sky-100 text-sky-700' : 'bg-purple-100 text-purple-700'
                                                    }`}>
                                                        {doc.doc_type === 'cv' ? 'CV' : 'Lettre'}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-gray-500">{doc.template_name || '—'}</td>
                                                <td className="py-3 text-gray-500">{new Date(doc.created_at).toLocaleDateString('fr-FR')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Paiements */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-black text-gray-900 mb-4">Historique des paiements</h2>
                        {payments.length === 0 ? (
                            <p className="text-sm text-gray-500">Aucun paiement effectué</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100 text-gray-400">
                                            <th className="pb-2 font-semibold">Template</th>
                                            <th className="pb-2 font-semibold">Montant</th>
                                            <th className="pb-2 font-semibold">Statut</th>
                                            <th className="pb-2 font-semibold">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {payments.slice(0, 5).map((p: any) => (
                                            <tr key={p.id}>
                                                <td className="py-3 font-medium text-gray-900">{p.template_name}</td>
                                                <td className="py-3 text-gray-900 font-bold">{p.amount} {p.currency}</td>
                                                <td className="py-3">
                                                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                        p.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        {p.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-gray-500">{new Date(p.created_at).toLocaleDateString('fr-FR')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Colonne Actions ── */}
                <div className="space-y-6">
                    {/* Action rapide */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-black text-gray-900 mb-4">Actions du compte</h2>
                        <div className="space-y-3">
                            <button
                                onClick={handleToggleActive}
                                className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all border ${
                                    user.is_active 
                                        ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100' 
                                        : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                                }`}
                            >
                                {user.is_active ? 'Désactiver le compte' : 'Activer le compte'}
                            </button>
                        </div>
                    </div>

                    {/* Envoyer Email */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-black text-gray-900 mb-4">Envoyer un email</h2>
                        <form onSubmit={handleSendEmail} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Sujet</label>
                                <input
                                    type="text"
                                    value={emailSubject}
                                    onChange={e => setEmailSubject(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Message</label>
                                <textarea
                                    value={emailMessage}
                                    onChange={e => setEmailMessage(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm h-32 resize-none focus:outline-none focus:border-emerald-500"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={sendingEmail}
                                className="w-full py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all disabled:opacity-50"
                            >
                                {sendingEmail ? 'Envoi en cours...' : 'Envoyer l\'email'}
                            </button>
                        </form>
                    </div>

                    {/* Réinitialiser Mot de Passe */}
                    {session?.user?.role === 'super_admin' && (
                        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 shadow-sm">
                            <h2 className="text-lg font-black text-red-700 mb-4">Danger Zone</h2>
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-red-600 mb-1">Nouveau mot de passe</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-red-200 rounded-lg text-sm focus:outline-none focus:border-red-500 text-red-900"
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={resettingPassword}
                                    className="w-full py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all disabled:opacity-50"
                                >
                                    {resettingPassword ? 'Réinitialisation...' : 'Forcer le mot de passe'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
