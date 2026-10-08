'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import config from '@/lib/config'
import { toast } from 'react-hot-toast'
import { Users, Banknote, Download, BrainCircuit, Activity, Coins } from 'lucide-react'

interface AIStats {
    total_operations: number
    total_cost_usd: number
    total_prompt_tokens: number
    total_completion_tokens: number
    avg_cost_per_operation_usd: number
    avg_cost_per_user_usd: number
    free_users_cost_usd: number
    paid_users_cost_usd: number
    models_breakdown: {
        model_name: string
        operations: number
        cost_usd: number
        prompt_tokens: number
        completion_tokens: number
    }[]
    operations_breakdown: {
        operation_type: string
        operations: number
        cost_usd: number
    }[]
}

interface ReportStat {
    period: string
    new_users: number
    new_cv: number
    new_letters: number
    revenue: number
    payment_count: number
}

interface Economics {
    total_users: number
    paying_users: number
    total_revenue_xof: number
    arpu_xof: number
    conversion_rate_pct: number
    renewal_rate_pct: number
    ai_cost_per_user_xof: number
    payment_cost_per_user_xof: number
    margin_per_user_xof: number
    total_margin_xof: number
}

export default function AdminReportsPage() {
    const { data: session } = useSession()
    const [reports, setReports] = useState<ReportStat[]>([])
    const [aiStats, setAiStats] = useState<AIStats | null>(null)
    const [economics, setEconomics] = useState<Economics | null>(null)
    const [loading, setLoading] = useState(true)

    // Export states
    const [exportingUsers, setExportingUsers] = useState(false)
    const [exportingPayments, setExportingPayments] = useState(false)
    const [paymentDays, setPaymentDays] = useState('90')

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const [resReports, resAi, resEcon] = await Promise.all([
                    fetch(`${config.apiBaseUrl}/admin/reports/monthly?months=6`, {
                        headers: { 'Authorization': `Bearer ${session?.user?.accessToken}` }
                    }),
                    fetch(`${config.apiBaseUrl}/admin/reports/ai-stats`, {
                        headers: { 'Authorization': `Bearer ${session?.user?.accessToken}` }
                    }),
                    fetch(`${config.apiBaseUrl}/admin/reports/economics`, {
                        headers: { 'Authorization': `Bearer ${session?.user?.accessToken}` }
                    })
                ])
                if (resReports.ok) {
                    setReports(await resReports.json())
                }
                if (resAi.ok) {
                    setAiStats(await resAi.json())
                }
                if (resEcon.ok) {
                    setEconomics(await resEcon.json())
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
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-semibold text-gray-900 mb-1">Rapports et Exports</h1>
                <p className="text-sm text-gray-500">Statistiques mensuelles et exports de données au format CSV.</p>
            </div>

            {/* Economics (MONEY-003) */}
            {economics && (
                <div className="bg-white border border-gray-200 rounded-md p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-8 h-8 bg-emerald-50 rounded-md flex items-center justify-center text-emerald-600 border border-emerald-100">
                            <Coins className="w-4 h-4" />
                        </div>
                        <h2 className="text-base font-semibold text-gray-900">Unit Economics & Métriques Clés</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div className="bg-gray-50 rounded-md p-4 border border-gray-100">
                            <p className="text-xs text-gray-500 font-medium mb-1">ARPU (Revenu moyen)</p>
                            <p className="text-xl font-bold text-gray-900">{Math.round(economics.arpu_xof)} XOF</p>
                            <p className="text-[10px] text-gray-400 mt-1">Total généré / Total utilisateurs</p>
                        </div>
                        <div className="bg-gray-50 rounded-md p-4 border border-gray-100">
                            <p className="text-xs text-gray-500 font-medium mb-1">Coût IA par Utilisateur</p>
                            <p className="text-xl font-bold text-gray-900">{Math.round(economics.ai_cost_per_user_xof)} XOF</p>
                            <p className="text-[10px] text-gray-400 mt-1">Tokens LLM / Total utilisateurs</p>
                        </div>
                        <div className="bg-gray-50 rounded-md p-4 border border-gray-100">
                            <p className="text-xs text-gray-500 font-medium mb-1">Coût Paiement (Est.)</p>
                            <p className="text-xl font-bold text-gray-900">{Math.round(economics.payment_cost_per_user_xof)} XOF</p>
                            <p className="text-[10px] text-gray-400 mt-1">Frais provider (2.5%) / Utilisateur</p>
                        </div>
                        <div className="bg-emerald-50 rounded-md p-4 border border-emerald-100">
                            <p className="text-xs text-emerald-700 font-medium mb-1">Marge Nette (par util.)</p>
                            <p className="text-xl font-bold text-emerald-900">{Math.round(economics.margin_per_user_xof)} XOF</p>
                            <p className="text-[10px] text-emerald-600/80 mt-1">Ce qu'il reste dans notre poche</p>
                        </div>
                        <div className="bg-indigo-50 rounded-md p-4 border border-indigo-100">
                            <p className="text-xs text-indigo-700 font-medium mb-1">Taux de Conversion</p>
                            <p className="text-xl font-bold text-indigo-900">{economics.conversion_rate_pct.toFixed(2)} %</p>
                            <p className="text-[10px] text-indigo-600/80 mt-1">{economics.paying_users} clients sur {economics.total_users} inscrits</p>
                        </div>
                        <div className="bg-indigo-50 rounded-md p-4 border border-indigo-100">
                            <p className="text-xs text-indigo-700 font-medium mb-1">Taux de Renouvellement</p>
                            <p className="text-xl font-bold text-indigo-900">{economics.renewal_rate_pct.toFixed(2)} %</p>
                            <p className="text-[10px] text-indigo-600/80 mt-1">Clients avec +1 paiement réussi</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Statistiques IA */}
            {aiStats && (
                <div className="bg-white border border-gray-200 rounded-md p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-8 h-8 bg-purple-50 rounded-md flex items-center justify-center text-purple-600 border border-purple-100">
                            <BrainCircuit className="w-4 h-4" />
                        </div>
                        <h2 className="text-base font-semibold text-gray-900">Coûts et Consommation IA</h2>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-gray-50 rounded-md border border-gray-100">
                            <div className="flex items-center gap-2 text-gray-500 mb-1">
                                <Activity className="w-4 h-4" />
                                <span className="text-xs font-medium uppercase tracking-wider">Opérations</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{aiStats.total_operations.toLocaleString()}</p>
                            <p className="text-xs text-gray-500 mt-1">{(aiStats.total_prompt_tokens + aiStats.total_completion_tokens).toLocaleString()} tokens</p>
                        </div>
                        
                        <div className="p-4 bg-gray-50 rounded-md border border-gray-100">
                            <div className="flex items-center gap-2 text-gray-500 mb-1">
                                <Coins className="w-4 h-4" />
                                <span className="text-xs font-medium uppercase tracking-wider">Coût Total</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">${aiStats.total_cost_usd.toFixed(4)}</p>
                            <p className="text-xs text-gray-500 mt-1">~${aiStats.avg_cost_per_operation_usd.toFixed(4)} / op</p>
                        </div>
                        
                        <div className="p-4 bg-gray-50 rounded-md border border-gray-100">
                            <div className="flex items-center gap-2 text-gray-500 mb-1">
                                <Users className="w-4 h-4" />
                                <span className="text-xs font-medium uppercase tracking-wider">Coût / Utilisateur</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">${aiStats.avg_cost_per_user_usd.toFixed(4)}</p>
                            <p className="text-xs text-gray-500 mt-1">En moyenne</p>
                        </div>

                        <div className="p-4 bg-purple-50 rounded-md border border-purple-100">
                            <div className="flex items-center gap-2 text-purple-600 mb-1">
                                <Banknote className="w-4 h-4" />
                                <span className="text-xs font-medium uppercase tracking-wider">Gratuit vs Payant</span>
                            </div>
                            <div className="mt-1 flex flex-col gap-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-purple-700">Plans Gratuits</span>
                                    <span className="text-sm font-semibold text-purple-900">${aiStats.free_users_cost_usd.toFixed(4)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-purple-700">Plans PRO</span>
                                    <span className="text-sm font-semibold text-purple-900">${aiStats.paid_users_cost_usd.toFixed(4)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Breakdown des Opérations & Modèles (Style Google Cloud) */}
                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Répartition par Modèle */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wider">Coûts par Modèle</h3>
                            <div className="overflow-hidden rounded-md border border-gray-200">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 font-medium text-gray-500">Modèle</th>
                                            <th className="px-4 py-2 font-medium text-gray-500 text-right">Requêtes</th>
                                            <th className="px-4 py-2 font-medium text-gray-500 text-right">Tokens</th>
                                            <th className="px-4 py-2 font-medium text-gray-500 text-right">Coût ($)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {aiStats.models_breakdown?.map((item) => (
                                            <tr key={item.model_name}>
                                                <td className="px-4 py-3 font-medium text-gray-900">{item.model_name}</td>
                                                <td className="px-4 py-3 text-right text-gray-600">{item.operations.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-right text-gray-500 text-xs">
                                                    {(item.prompt_tokens + item.completion_tokens).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold text-gray-900">
                                                    {item.cost_usd.toFixed(4)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Répartition par Type d'Opération */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wider">Coûts par Type d'Opération</h3>
                            <div className="overflow-hidden rounded-md border border-gray-200">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 font-medium text-gray-500">Service / Action</th>
                                            <th className="px-4 py-2 font-medium text-gray-500 text-right">Requêtes</th>
                                            <th className="px-4 py-2 font-medium text-gray-500 text-right">Coût ($)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {aiStats.operations_breakdown?.map((item) => (
                                            <tr key={item.operation_type}>
                                                <td className="px-4 py-3 font-medium text-gray-900 capitalize">{item.operation_type.replace(/_/g, ' ')}</td>
                                                <td className="px-4 py-3 text-right text-gray-600">{item.operations.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-right font-semibold text-gray-900">
                                                    {item.cost_usd.toFixed(4)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Actions d'export */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Export Utilisateurs */}
                <div className="bg-white border border-gray-200 rounded-md p-5 shadow-sm flex flex-col items-start">
                    <div className="w-10 h-10 bg-sky-50 rounded-md flex items-center justify-center text-sky-600 mb-4 border border-sky-100">
                        <Users className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Export Utilisateurs</h2>
                    <p className="text-sm text-gray-500 mb-6 flex-1">
                        Exporte la liste complète de tous les utilisateurs inscrits avec leurs statistiques d'utilisation (nombre de CVs, lettres et paiements).
                    </p>
                    <button
                        onClick={handleExportUsers}
                        disabled={exportingUsers}
                        className="w-full py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {exportingUsers ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        ) : (
                            <><Download className="w-4 h-4" /> Télécharger CSV</>
                        )}
                    </button>
                </div>

                {/* Export Paiements */}
                <div className="bg-white border border-gray-200 rounded-md p-5 shadow-sm flex flex-col items-start">
                    <div className="w-10 h-10 bg-emerald-50 rounded-md flex items-center justify-center text-emerald-600 mb-4 border border-emerald-100">
                        <Banknote className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Export Paiements</h2>
                    <p className="text-sm text-gray-500 mb-4 flex-1">
                        Exporte l'historique des transactions financières sur une période donnée.
                    </p>
                    <div className="w-full space-y-3">
                        <select 
                            value={paymentDays}
                            onChange={(e) => setPaymentDays(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-200"
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
                            className="w-full py-2 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-md border border-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {exportingPayments ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600" />
                            ) : (
                                <><Download className="w-4 h-4" /> Télécharger CSV</>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Rapport Mensuel */}
            <div className="bg-white border border-gray-200 rounded-md p-5 shadow-sm">
                <h2 className="text-base font-semibold text-gray-900 mb-5">Évolution mensuelle (6 derniers mois)</h2>
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
                                <tr className="border-b border-gray-200 text-gray-500">
                                    <th className="pb-3 font-semibold uppercase tracking-wider text-xs">Période</th>
                                    <th className="pb-3 font-semibold uppercase tracking-wider text-xs text-right">Inscriptions</th>
                                    <th className="pb-3 font-semibold uppercase tracking-wider text-xs text-right">Nouveaux CVs</th>
                                    <th className="pb-3 font-semibold uppercase tracking-wider text-xs text-right">Nouvelles Lettres</th>
                                    <th className="pb-3 font-semibold uppercase tracking-wider text-xs text-right text-emerald-600">Revenus générés</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {reports.map((report) => (
                                    <tr key={report.period} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 font-semibold text-gray-900 capitalize">{report.period}</td>
                                        <td className="py-4 text-right font-medium text-gray-600">+{report.new_users}</td>
                                        <td className="py-4 text-right font-medium text-sky-600">+{report.new_cv}</td>
                                        <td className="py-4 text-right font-medium text-purple-600">+{report.new_letters}</td>
                                        <td className="py-4 text-right font-semibold text-emerald-600">
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
