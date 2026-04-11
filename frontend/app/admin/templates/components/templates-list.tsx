// app/admin/templates/components/templates-list.tsx
'use client'

import { useState, useEffect } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import Link from 'next/link'
import { Template } from '@/types/template'

export function AdminTemplatesList() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/admin/templates')
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des templates')
        }
        const data = await response.json()
        setTemplates(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTemplates()
  }, [])

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) {
      try {
        const response = await fetch(`/api/admin/templates/${id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          setTemplates(templates.filter(template => template.id !== id))
        } else {
          throw new Error('Échec de la suppression')
        }
      } catch (err) {
        setError('Erreur lors de la suppression du template')
        console.error(err)
      }
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Chargement des templates...</div>
  }

  if (error) {
    return <div className="text-red-600 text-center py-8">{error}</div>
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h2 className="text-xl font-semibold text-gray-900">Gestion des templates</h2>
          <p className="mt-2 text-sm text-gray-700">
            Créez et gérez les modèles de CV disponibles pour les utilisateurs
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/admin/templates/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Nouveau template
          </Link>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Nom
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Catégorie
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Statut
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Premium
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {templates.map((template) => (
                    <tr key={template.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {template.name}
                        <div className="text-gray-500 text-xs mt-1">/{template.slug}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {template.category}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          template.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {template.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {template.is_premium ? 'Oui' : 'Non'}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex space-x-2 justify-end">
                          <Link
                            href={`/admin/templates/${template.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Pencil className="h-5 w-5" aria-hidden="true" />
                            <span className="sr-only">Modifier</span>
                          </Link>
                          <button
                            onClick={() => handleDelete(template.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-5 w-5" aria-hidden="true" />
                            <span className="sr-only">Supprimer</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}