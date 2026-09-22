'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import config from '@/lib/config'

interface Template {
  id: string
  slug: string
  name: string
  description: string
  price: number
  currency: string
  preview_image?: string
  is_active: boolean
  is_system: boolean
  created_at: string
  updated_at: string
  folder_name: string
}

export default function TemplatesPage() {
  const { data: session, status } = useSession()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  useEffect(() => {
    const fetchTemplates = async () => {
      if (!session?.user?.accessToken) {
        return
      }

      try {
        const response = await fetch(`${config.apiBaseUrl}/admin/templates/`, {
          headers: {
            'Authorization': `Bearer ${session.user.accessToken}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.detail || 'Impossible de charger les templates')
        }

        const data = await response.json()
        setTemplates(data)
      } catch (error: any) {
        console.error('Fetch error:', error)
        toast.error(error.message || 'Erreur lors du chargement des templates')
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchTemplates()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status, session])

  const toggleTemplate = async (templateId: string) => {
    if (!session?.user?.accessToken) {
      toast.error("Token d'authentification non trouvé")
      return
    }

    try {
      const response = await fetch(`${config.apiBaseUrl}/admin/templates/${templateId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Impossible de modifier le statut')
      }

      const updatedTemplate = await response.json()
      setTemplates(templates.map(t => t.id === templateId ? updatedTemplate : t))
      toast.success(`Modèle "${updatedTemplate.name}" ${updatedTemplate.is_active ? 'activé' : 'désactivé'}`)
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <p className="text-sm text-gray-500 font-medium">Chargement des modèles...</p>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-lg mx-auto mt-12 p-8">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Accès Administrateur Requis</h3>
        <p className="text-sm text-gray-500 mb-6">Veuillez vous connecter avec un compte administrateur pour gérer les modèles.</p>
        <Link
          href="/login"
          className="inline-flex items-center px-5 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
        >
          Se connecter
        </Link>
      </div>
    )
  }

  const activeCount = templates.filter(t => t.is_active).length
  const freeCount = templates.filter(t => Number(t.price) === 0).length
  const premiumCount = templates.filter(t => Number(t.price) > 0).length

  const filteredTemplates = templates.filter(t => {
    if (filter === 'active') return t.is_active
    if (filter === 'inactive') return !t.is_active
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Modèles de CV</h1>
          <p className="text-sm text-gray-500 mt-1">Configurez les tarifs, visibilités et prévisualisations de vos templates.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/templates/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Nouveau Modèle
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Total Modèles</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{templates.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold uppercase text-emerald-600 tracking-wider">Actifs en ligne</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold uppercase text-blue-600 tracking-wider">Modèles Gratuits</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{freeCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold uppercase text-amber-600 tracking-wider">Modèles Premium</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{premiumCount}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filter === 'all' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Tous ({templates.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filter === 'active' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Actifs ({activeCount})
        </button>
        <button
          onClick={() => setFilter('inactive')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filter === 'inactive' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Inactifs ({templates.length - activeCount})
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Modèle</th>
                <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Slug / Dossier</th>
                <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Tarification</th>
                <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Rôle</th>
                <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredTemplates.map((template) => {
                const isFree = Number(template.price) === 0
                return (
                  <tr key={template.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                          {template.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{template.name}</div>
                          <div className="text-xs text-gray-500 line-clamp-1 max-w-xs">{template.description || 'Sans description'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-600">
                      <span className="px-2 py-1 bg-gray-100 rounded-md">{template.slug}</span>
                    </td>
                    <td className="px-6 py-4">
                      {isFree ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Gratuit (0 FCFA)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          {template.price} {template.currency || 'FCFA'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleTemplate(template.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          template.is_active
                            ? 'bg-emerald-100/70 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-red-100/70 text-red-800 hover:bg-red-200'
                        }`}
                        title="Cliquer pour changer le statut"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${template.is_active ? 'bg-emerald-600' : 'bg-red-600'}`}></span>
                        {template.is_active ? 'En ligne' : 'Désactivé'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-500">
                      {template.is_system ? (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-semibold">Système</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded font-semibold">Custom</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/editor?template=${template.slug}`}
                          target="_blank"
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Tester directement dans l'éditeur"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </Link>
                        <Link
                          href={`/admin/templates/${template.id}`}
                          className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Consulter les détails"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </Link>
                        <Link
                          href={`/admin/templates/${template.id}/edit`}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          Modifier
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-8">
          <p className="text-gray-500 font-medium">Aucun modèle ne correspond à ce filtre.</p>
        </div>
      )}
    </div>
  )
}
