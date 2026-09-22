'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import config from '@/lib/config'
import { toast } from 'react-hot-toast'

interface ReportStat {
    period: string
    new_users: number
    new_cv: number
    new_letters: number
    revenue: number
    payment_count: number
}

export default function AdminReportsPage() {
    const { data: session } = useSession()
    const [reports, setReports] = useState<ReportStat[]>([])
    const [loading, setLoading] = useState(true)

    // Export states
    const [exportingUsers, setExportingUsers] = useState(false)
    const [exportingPayments, setExportingPayments] = useState(false)
    const [paymentDays, setPaymentDays] = useState('90')

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await fetch(`${config.apiBaseUrl}/admin/reports/monthly?months=6`, {
                    headers: { 'Authorization': `Bearer ${session?.user?.accessToken}` }
                })
                if (res.ok) {
                    setReports(await res.json())
                }
            } catch (err: any) {
                toast.error(err.message)
            } finally {
                setLoading(false)
            }
        }
        if (session?.user?.accessToken) fetchReports()
    }, [session])

    const handleExportUsers = async () => {
        setExportingUsers(true)
        try {
            const res = await fetch(`${config.apiBaseUrl}/admin/reports/users.csv`, {
                headers: { 'Authorization': `Bearer ${session?.user?.accessToken}` }
            })
            if (!res.ok) throw new Error('Erreur lors de l\'export')
            
            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${(process.env.NEXT_PUBLIC_APP_NAME || 'carriey').toLowerCase()}_utilisateurs_${new Date().toISOString().split('T')[0]}.csv`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            a.remove()
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setExportingUsers(false)
        }
    }

    const handleExportPayments = async () => {
        setExportingPayments(true)
        try {
            const res = await fetch(`${config.apiBaseUrl}/admin/reports/payments.csv?days=${paymentDays}`, {
                headers: { 'Authorization': `Bearer ${session?.user?.accessToken}` }
            })
            if (!res.ok) throw new Error('Erreur lors de l\'export')
            
            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${(process.env.NEXT_PUBLIC_APP_NAME || 'carriey').toLowerCase()}_paiements_${new Date().toISOString().split('T')[0]}.csv`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            a.remove()
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setExportingPayments(false)
        }
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">Rapports et Exports</h1>
                <p className="text-gray-500">Statistiques mensuelles et exports de données au format CSV.</p>
            </div>

            {/* Actions d'export */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Export Utilisateurs */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col items-start">
                    <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center text-2xl mb-4">
                        👥
                    </div>
                    <h2 className="text-lg font-black text-gray-900 mb-2">Export Utilisateurs</h2>
                    <p className="text-sm text-gray-500 mb-6 flex-1">
                        Exporte la liste complète de tous les utilisateurs inscrits avec leurs statistiques d'utilisation (nombre de CVs, lettres et paiements).
                    </p>
                    <button
                        onClick={handleExportUsers}
                        disabled={exportingUsers}
                        className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {exportingUsers ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                        ) : (
                            <>📥 Télécharger CSV</>
                        )}
                    </button>
                </div>

                {/* Export Paiements */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col items-start">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl mb-4">
                        💰
                    </div>
                    <h2 className="text-lg font-black text-gray-900 mb-2">Export Paiements</h2>
                    <p className="text-sm text-gray-500 mb-4 flex-1">
                        Exporte l'historique des transactions financières sur une période donnée.
                    </p>
                    <div className="w-full space-y-3">
                        <select 
                            value={paymentDays}
                            onChange={(e) => setPaymentDays(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none"
                        >
                            <option value="30">30 derniers jours</option>
                            <option value="90">90 derniers jours</option>
                            <option value="180">6 derniers mois</option>
                            <option value="365">12 derniers mois</option>
                            <option value="9999">Tout l'historique</option>
                        </select>
                        <button
                            onClick={handleExportPayments}
                            disabled={exportingPayments}
                            className="w-full py-3 bg-emerald-50 text-emerald-600 font-bold rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {exportingPayments ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600" />
                            ) : (
                                <>📥 Télécharger CSV</>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Rapport Mensuel */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-black text-gray-900 mb-6">Évolution mensuelle (6 derniers mois)</h2>
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
                    </div>
                ) : reports.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Aucune donnée disponible</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-400">
                                    <th className="pb-3 font-bold uppercase tracking-widest text-xs">Période</th>
                                    <th className="pb-3 font-bold uppercase tracking-widest text-xs text-right">Inscriptions</th>
                                    <th className="pb-3 font-bold uppercase tracking-widest text-xs text-right">Nouveaux CVs</th>
                                    <th className="pb-3 font-bold uppercase tracking-widest text-xs text-right">Nouvelles Lettres</th>
                                    <th className="pb-3 font-bold uppercase tracking-widest text-xs text-right text-emerald-600">Revenus générés</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {reports.map((report) => (
                                    <tr key={report.period} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 font-black text-gray-900 capitalize">{report.period}</td>
                                        <td className="py-4 text-right font-semibold text-gray-600">+{report.new_users}</td>
                                        <td className="py-4 text-right font-semibold text-sky-600">+{report.new_cv}</td>
                                        <td className="py-4 text-right font-semibold text-purple-600">+{report.new_letters}</td>
                                        <td className="py-4 text-right font-black text-emerald-600">
                                            {report.revenue > 0 ? `${report.revenue.toLocaleString()} XOF` : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
