'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import config from '@/lib/config'
import { toast } from 'react-hot-toast'

interface Stats {
  total_users: number
  active_users: number
  total_templates: number
  active_templates: number
  total_resumes: number
  total_payments: number
  successful_payments: number
  total_revenue: number
  revenue_currency: string
}

interface ChartData {
    date: string
    revenue: number
    count: number
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<Stats | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${session?.user?.accessToken}` }
        const [resOverview, resChart] = await Promise.all([
            fetch(`${config.apiBaseUrl}/admin/stats/overview`, { headers }),
            fetch(`${config.apiBaseUrl}/admin/reports/revenue-chart?days=30`, { headers })
        ])
        
        if (resOverview.status === 401) {
          toast.error("Session expirée. Veuillez vous reconnecter.")
          signOut({ callbackUrl: '/login' })
          return
        }
        
        if (!resOverview.ok) throw new Error('Erreur chargement des statistiques')
        
        setStats(await resOverview.json())
        if (resChart.ok) setChartData(await resChart.json())
      } catch (err: any) {
        toast.error(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.accessToken) {
      fetchStats()
    }
  }, [session])

  const StatCard = ({ title, value, icon, color, subValue }: { title: string, value: string | number, icon: string, color: string, subValue?: string }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
          {icon}
        </div>
      </div>
      <div>
        <h3 className="text-3xl font-black text-gray-900 mb-1">{value}</h3>
        <p className="text-sm font-semibold text-gray-500">{title}</p>
        {subValue && <p className="text-xs text-gray-400 mt-2">{subValue}</p>}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  // Calcul pour le graphique (max value pour hauteur relative)
  const maxRevenue = chartData.length > 0 ? Math.max(...chartData.map(d => d.revenue)) : 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Tableau de bord</h1>
        <p className="text-gray-500">Vue d'ensemble des performances de la plateforme CVtor.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Utilisateurs"
          value={stats?.total_users || 0}
          subValue={`${stats?.active_users || 0} comptes actifs`}
          icon="👥"
          color="bg-sky-100 text-sky-600"
        />
        <StatCard
          title="Documents"
          value={stats?.total_resumes || 0}
          subValue="CVs et lettres générés"
          icon="📄"
          color="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          title="Templates"
          value={stats?.total_templates || 0}
          subValue={`${stats?.active_templates || 0} modèles publiés`}
          icon="🎨"
          color="bg-purple-100 text-purple-600"
        />
        <StatCard
          title="Revenu Total"
          value={`${stats?.total_revenue?.toLocaleString() || 0} ${stats?.revenue_currency || 'XOF'}`}
          subValue={`${stats?.successful_payments || 0} paiements validés`}
          icon="💰"
          color="bg-amber-100 text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Graphique des revenus (2/3 de l'espace) */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="mb-6">
                  <h3 className="text-lg font-black text-gray-900">Revenus (30 derniers jours)</h3>
                  <p className="text-sm text-gray-500">Évolution journalière du chiffre d'affaires</p>
              </div>
              
              <div className="h-64 flex items-end gap-2 px-2">
                  {chartData.length === 0 ? (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                          Pas de données pour cette période
                      </div>
                  ) : (
                      chartData.map((data, i) => {
                          const height = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0
                          const isZero = height === 0
                          return (
                              <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                                  {/* Tooltip */}
                                  <div className="opacity-0 group-hover:opacity-100 absolute -top-12 bg-gray-900 text-white text-[10px] py-1.5 px-3 rounded-lg font-bold transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                      {new Date(data.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}<br/>
                                      {data.revenue.toLocaleString()} XOF
                                  </div>
                                  {/* Bar */}
                                  <div 
                                      className={`w-full rounded-t-sm transition-all duration-300 ${isZero ? 'bg-gray-100 min-h-[2px]' : 'bg-emerald-500 hover:bg-emerald-400'}`}
                                      style={{ height: `${Math.max(height, 1)}%` }}
                                  ></div>
                              </div>
                          )
                      })
                  )}
              </div>
          </div>

          {/* Raccourcis (1/3 de l'espace) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-black text-gray-900 mb-4">Accès rapides</h3>
              <div className="space-y-3">
                  <Link href="/admin/users" className="flex items-center p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group">
                      <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center text-lg mr-3 group-hover:scale-110 transition-transform">👥</div>
                      <div>
                          <div className="font-bold text-gray-900 text-sm">Gérer les utilisateurs</div>
                          <div className="text-xs text-gray-500">Rôles, comptes, détails</div>
                      </div>
                  </Link>
                  <Link href="/admin/resumes" className="flex items-center p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg mr-3 group-hover:scale-110 transition-transform">📄</div>
                      <div>
                          <div className="font-bold text-gray-900 text-sm">Documents générés</div>
                          <div className="text-xs text-gray-500">Liste des CVs et lettres</div>
                      </div>
                  </Link>
                  <Link href="/admin/templates" className="flex items-center p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group">
                      <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-lg mr-3 group-hover:scale-110 transition-transform">🎨</div>
                      <div>
                          <div className="font-bold text-gray-900 text-sm">Catalogue Modèles</div>
                          <div className="text-xs text-gray-500">Ajouter ou modifier</div>
                      </div>
                  </Link>
                  <Link href="/admin/reports" className="flex items-center p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-lg mr-3 group-hover:scale-110 transition-transform">📉</div>
                      <div>
                          <div className="font-bold text-gray-900 text-sm">Rapports & Exports</div>
                          <div className="text-xs text-gray-500">Télécharger les CSV</div>
                      </div>
                  </Link>
              </div>
          </div>
      </div>
    </div>
  )
}