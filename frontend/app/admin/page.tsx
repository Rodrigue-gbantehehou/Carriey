'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import config from '@/lib/config'
import { toast } from 'react-hot-toast'
import { Users, FileText, LayoutTemplate, Coins, LineChart } from 'lucide-react'

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

  const StatCard = ({ title, value, icon: Icon, color, subValue }: { title: string, value: string | number, icon: React.ElementType, color: string, subValue?: string }) => (
    <div className="bg-white rounded-md shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-md flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-1">{value}</h3>
        <p className="text-sm text-gray-500">{title}</p>
        {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
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
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Tableau de bord</h1>
        <p className="text-sm text-gray-500">Vue d'ensemble des performances de la plateforme Carriey.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Utilisateurs"
          value={stats?.total_users || 0}
          subValue={`${stats?.active_users || 0} comptes actifs`}
          icon={Users}
          color="bg-sky-50 text-sky-600 border border-sky-100"
        />
        <StatCard
          title="Documents"
          value={stats?.total_resumes || 0}
          subValue="CVs et lettres générés"
          icon={FileText}
          color="bg-emerald-50 text-emerald-600 border border-emerald-100"
        />
        <StatCard
          title="Templates"
          value={stats?.total_templates || 0}
          subValue={`${stats?.active_templates || 0} modèles publiés`}
          icon={LayoutTemplate}
          color="bg-purple-50 text-purple-600 border border-purple-100"
        />
        <StatCard
          title="Revenu Total"
          value={`${stats?.total_revenue?.toLocaleString() || 0} ${stats?.revenue_currency || 'XOF'}`}
          subValue={`${stats?.successful_payments || 0} paiements validés`}
          icon={Coins}
          color="bg-amber-50 text-amber-600 border border-amber-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Graphique des revenus (2/3 de l'espace) */}
          <div className="lg:col-span-2 bg-white rounded-md shadow-sm border border-gray-200 p-5">
              <div className="mb-5">
                  <h3 className="text-base font-semibold text-gray-900">Revenus (30 derniers jours)</h3>
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
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Accès rapides</h3>
              <div className="space-y-2">
                  <Link href="/admin/users" className="flex items-center p-2.5 rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors group">
                      <div className="w-8 h-8 rounded-md bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center mr-3">
                          <Users className="w-4 h-4" />
                      </div>
                      <div>
                          <div className="font-medium text-gray-900 text-sm">Gérer les utilisateurs</div>
                          <div className="text-xs text-gray-500 mt-0.5">Rôles, comptes, détails</div>
                      </div>
                  </Link>
                  <Link href="/admin/resumes" className="flex items-center p-2.5 rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors group">
                      <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mr-3">
                          <FileText className="w-4 h-4" />
                      </div>
                      <div>
                          <div className="font-medium text-gray-900 text-sm">Documents générés</div>
                          <div className="text-xs text-gray-500 mt-0.5">Liste des CVs et lettres</div>
                      </div>
                  </Link>
                  <Link href="/admin/templates" className="flex items-center p-2.5 rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors group">
                      <div className="w-8 h-8 rounded-md bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center mr-3">
                          <LayoutTemplate className="w-4 h-4" />
                      </div>
                      <div>
                          <div className="font-medium text-gray-900 text-sm">Catalogue Modèles</div>
                          <div className="text-xs text-gray-500 mt-0.5">Ajouter ou modifier</div>
                      </div>
                  </Link>
                  <Link href="/admin/reports" className="flex items-center p-2.5 rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors group">
                      <div className="w-8 h-8 rounded-md bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center mr-3">
                          <LineChart className="w-4 h-4" />
                      </div>
                      <div>
                          <div className="font-medium text-gray-900 text-sm">Rapports & Exports</div>
                          <div className="text-xs text-gray-500 mt-0.5">Télécharger les CSV</div>
                      </div>
                  </Link>
              </div>
          </div>
      </div>
    </div>
  )
}