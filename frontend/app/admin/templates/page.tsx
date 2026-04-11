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

  useEffect(() => {
    const fetchTemplates = async () => {
      console.log('🔍 fetchTemplates called')
      console.log('🔍 Session:', session)
      console.log('🔍 Status:', status)
      console.log('🔍 Token exists:', !!session?.user?.accessToken)

      if (!session?.user?.accessToken) {
        console.error('❌ Token d\'authentification non trouvé')
        toast.error('Token d\'authentification non trouvé')
        return
      }

      console.log('🔍 API URL:', `${config.apiBaseUrl}/admin/templates/`)

      try {
        const response = await fetch(`${config.apiBaseUrl}/admin/templates/`, {
          headers: {
            'Authorization': `Bearer ${session.user.accessToken}`,
            'Content-Type': 'application/json'
          }
        })

        console.log('🔍 Response status:', response.status)
        console.log('🔍 Response ok:', response.ok)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('❌ Error data:', errorData)
          throw new Error(errorData.detail || 'Impossible de charger les templates')
        }

        const data = await response.json()
        console.log('✅ Templates loaded:', data)
        setTemplates(data)
      } catch (error) {
        console.error('❌ Fetch error:', error)
        toast.error('Erreur lors du chargement des templates')
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchTemplates()
    } else if (status === 'unauthenticated') {
      toast.error('Veuillez vous connecter pour accéder à cette page')
      setLoading(false)
    }
  }, [status, session])

  const toggleTemplate = async (templateId: string, currentStatus: boolean) => {
    if (!session?.user?.accessToken) {
      toast.error('Token d\'authentification non trouvé')
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
        throw new Error(errorData.detail || 'Impossible de mettre à jour le template')
      }

      const updatedTemplate = await response.json()
      setTemplates(templates.map(t => t.id === templateId ? updatedTemplate : t))
      toast.success(`Template ${updatedTemplate.is_active ? 'activé' : 'désactivé'} avec succès`)
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
      console.error('Erreur toggleTemplate:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg">Veuillez vous connecter pour accéder à cette page</div>
        <Link
          href="/login"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Se connecter
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Templates</h1>
        <div className="space-x-4">
          <Link
            href="/admin/templates/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            Créer un Template
          </Link>
          <Link
            href="/admin/templates/upload"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Upload des Fichiers
          </Link>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Template
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prix
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {templates.map((template) => (
              <tr key={template.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{template.name}</div>
                    <div className="text-sm text-gray-500">{template.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {template.slug}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {template.price} {template.currency}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${template.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                    }`}>
                    {template.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${template.is_system
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                    }`}>
                    {template.is_system ? 'Système' : 'Personnalisé'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Link
                    href={`/admin/templates/${template.id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Voir
                  </Link>
                  <Link
                    href={`/admin/templates/${template.id}/edit`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Modifier
                  </Link>
                  <button
                    onClick={() => toggleTemplate(template.id, template.is_active)}
                    className={`${template.is_active
                        ? 'text-red-600 hover:text-red-900'
                        : 'text-green-600 hover:text-green-900'
                      }`}
                  >
                    {template.is_active ? 'Désactiver' : 'Activer'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">Aucun template trouvé</div>
          <Link
            href="/admin/templates/new"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Créer le premier template
          </Link>
        </div>
      )}
    </div>
  )
}
