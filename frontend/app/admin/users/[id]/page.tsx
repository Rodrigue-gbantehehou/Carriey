'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import config from '@/lib/config'
import { toast } from 'react-hot-toast'
import { FileText, Mail, CreditCard, Banknote, ArrowLeft } from 'lucide-react'

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
                    <Link href="/admin/users" className="text-gray-500 hover:text-gray-900 text-sm mb-3 inline-flex items-center gap-1 font-medium transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Retour aux utilisateurs
                    </Link>
                    <h1 className="text-xl font-semibold text-gray-900 mb-1">{user.full_name || 'Utilisateur sans nom'}</h1>
                    <p className="text-gray-500 text-sm">{user.email}</p>
                </div>
                <div>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${
                        user.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                        {user.is_active ? 'Actif' : 'Désactivé'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'CV créés', value: stats.total_cv, icon: FileText, color: 'text-sky-600 bg-sky-50' },
                    { label: 'Lettres créées', value: stats.total_letters, icon: Mail, color: 'text-purple-600 bg-purple-50' },
                    { label: 'Paiements effectués', value: stats.total_payments, icon: CreditCard, color: 'text-emerald-600 bg-emerald-50' },
                    { label: 'Total dépensé', value: `${stats.total_paid} XOF`, icon: Banknote, color: 'text-amber-600 bg-amber-50' },
                ].map((s) => (
                    <div key={s.label} className="bg-white border border-gray-200 rounded-md p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-8 h-8 rounded-md flex items-center justify-center ${s.color}`}>
                                <s.icon className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-semibold text-gray-900">{s.value}</div>
                        <div className="text-xs font-medium text-gray-500 mt-1">{s.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* ── Colonne Principale (Docs & Paiements) ── */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Documents */}
                    <div className="bg-white border border-gray-200 rounded-md p-5 shadow-sm">
                        <h2 className="text-base font-semibold text-gray-900 mb-4">Documents récents</h2>
                        {documents.length === 0 ? (
                            <p className="text-sm text-gray-500">Aucun document créé</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 text-gray-500">
                                            <th className="pb-3 text-xs font-semibold uppercase tracking-wider">Titre</th>
                                            <th className="pb-3 text-xs font-semibold uppercase tracking-wider">Type</th>
                                            <th className="pb-3 text-xs font-semibold uppercase tracking-wider">Template</th>
                                            <th className="pb-3 text-xs font-semibold uppercase tracking-wider">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {documents.slice(0, 5).map((doc: any) => (
                                            <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="py-3 font-medium text-gray-900">{doc.title}</td>
                                                <td className="py-3">
                                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                                                        doc.doc_type === 'cv' ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-purple-50 text-purple-700 border-purple-200'
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
                    <div className="bg-white border border-gray-200 rounded-md p-5 shadow-sm">
                        <h2 className="text-base font-semibold text-gray-900 mb-4">Historique des paiements</h2>
                        {payments.length === 0 ? (
                            <p className="text-sm text-gray-500">Aucun paiement effectué</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 text-gray-500">
                                            <th className="pb-3 text-xs font-semibold uppercase tracking-wider">Template</th>
                                            <th className="pb-3 text-xs font-semibold uppercase tracking-wider">Montant</th>
                                            <th className="pb-3 text-xs font-semibold uppercase tracking-wider">Statut</th>
                                            <th className="pb-3 text-xs font-semibold uppercase tracking-wider">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {payments.slice(0, 5).map((p: any) => (
                                            <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="py-3 font-medium text-gray-900">{p.template_name}</td>
                                                <td className="py-3 text-gray-900 font-semibold">{p.amount} {p.currency}</td>
                                                <td className="py-3">
                                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                                                        p.status === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
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
                    <div className="bg-white border border-gray-200 rounded-md p-5 shadow-sm">
                        <h2 className="text-base font-semibold text-gray-900 mb-4">Actions du compte</h2>
                        <div className="space-y-3">
                            <button
                                onClick={handleToggleActive}
                                className={`w-full py-2 rounded-md text-sm font-medium transition-all border ${
                                    user.is_active 
                                        ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' 
                                        : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                                }`}
                            >
                                {user.is_active ? 'Désactiver le compte' : 'Activer le compte'}
                            </button>
                        </div>
                    </div>

                    {/* Envoyer Email */}
                    <div className="bg-white border border-gray-200 rounded-md p-5 shadow-sm">
                        <h2 className="text-base font-semibold text-gray-900 mb-4">Envoyer un email</h2>
                        <form onSubmit={handleSendEmail} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Sujet</label>
                                <input
                                    type="text"
                                    value={emailSubject}
                                    onChange={e => setEmailSubject(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Message</label>
                                <textarea
                                    value={emailMessage}
                                    onChange={e => setEmailMessage(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm h-32 resize-none focus:outline-none focus:ring-2 focus:ring-gray-200"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={sendingEmail}
                                className="w-full py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                            >
                                {sendingEmail ? 'Envoi en cours...' : 'Envoyer l\'email'}
                            </button>
                        </form>
                    </div>

                    {/* Réinitialiser Mot de Passe */}
                    {session?.user?.role === 'super_admin' && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-5 shadow-sm">
                            <h2 className="text-base font-semibold text-red-700 mb-4">Zone de danger</h2>
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-red-700 mb-1">Nouveau mot de passe</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-red-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-200 text-red-900"
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={resettingPassword}
                                    className="w-full py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
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
