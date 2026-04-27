'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
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

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${config.apiBaseUrl}/admin/stats/overview`, {
          headers: {
            'Authorization': `Bearer ${session?.user?.accessToken}`
          }
        })
        if (!res.ok) throw new Error('Erreur lors du chargement des statistiques')
        const data = await res.json()
        setStats(data)
      } catch (err: any) {
        toast.error(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.accessToken) {
      fetchStats()
    } else if (!session) {
      setLoading(false)
    }
  }, [session])

  const StatCard = ({ title, value, icon, color, subValue }: { title: string, value: string | number, icon: any, color: string, subValue?: string }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de bord Admin</h1>
        <p className="text-gray-500">Aperçu des performances de la plateforme CVtor</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Utilisateurs"
          value={stats?.total_users || 0}
          subValue={`${stats?.active_users || 0} actifs`}
          icon={
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          color="bg-blue-50"
        />
        <StatCard
          title="Revenue Total"
          value={`${stats?.total_revenue?.toLocaleString() || 0} ${stats?.revenue_currency || 'XOF'}`}
          subValue={`${stats?.successful_payments || 0} ventes réussies`}
          icon={
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="bg-green-50"
        />
        <StatCard
          title="Templates"
          value={stats?.total_templates || 0}
          subValue={`${stats?.active_templates || 0} publiés`}
          icon={
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          }
          color="bg-purple-50"
        />
        <StatCard
          title="CV Créés"
          value={stats?.total_resumes || 0}
          subValue="Total généré"
          icon={
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          color="bg-amber-50"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Actions Rapides</h3>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/admin/templates/create"
              className="flex items-center p-4 rounded-lg border border-gray-100 hover:bg-blue-50 hover:border-blue-200 transition-all group"
            >
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors mr-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Nouveau Template</p>
                <p className="text-xs text-gray-500">Ajouter via l&apos;assistant</p>
              </div>
            </Link>
            <Link
              href="/admin/templates"
              className="flex items-center p-4 rounded-lg border border-gray-100 hover:bg-green-50 hover:border-green-200 transition-all group"
            >
              <div className="p-3 rounded-full bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors mr-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Gérer les Templates</p>
                <p className="text-xs text-gray-500">Liste et modifications</p>
              </div>
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center p-4 rounded-lg border border-gray-100 hover:bg-purple-50 hover:border-purple-200 transition-all group"
            >
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors mr-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Utilisateurs</p>
                <p className="text-xs text-gray-500">Gérer les accès et rôles</p>
              </div>
            </Link>
            <Link
              href="/admin/payments"
              className="flex items-center p-4 rounded-lg border border-gray-100 hover:bg-emerald-50 hover:border-emerald-200 transition-all group"
            >
              <div className="p-3 rounded-full bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors mr-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Paiements</p>
                <p className="text-xs text-gray-500">Suivi des transactions</p>
              </div>
            </Link>
            <Link
              href="/admin/audit"
              className="flex items-center p-4 rounded-lg border border-gray-100 hover:bg-amber-50 hover:border-amber-200 transition-all group"
            >
              <div className="p-3 rounded-full bg-amber-100 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors mr-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              </div>
              <div>
                 <p className="font-semibold text-gray-900">Journaux d&apos;Audit</p>
                <p className="text-xs text-gray-500">Sécurité et traçabilité</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4">Support & Aide</h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-800 font-medium mb-1">Besoin d&apos;aide ?</p>
              <p className="text-xs text-blue-600">Consultez la documentation pour apprendre à créer des templates complexes.</p>
              <button className="mt-3 text-sm font-semibold text-blue-700 hover:text-blue-900">Lire la doc →</button>
            </div>
            <div className="flex items-center justify-between p-3 text-sm text-gray-600 border-b border-gray-50">
              <span>Version Backend</span>
              <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">v1.2.4</span>
            </div>
            <div className="flex items-center justify-between p-3 text-sm text-gray-600 border-b border-gray-50">
              <span>Statut Serveur</span>
              <span className="flex items-center text-green-600 text-xs font-semibold">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Opérationnel
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}