'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import config from '@/lib/config'

export default function NewTemplatePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // État du formulaire
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    currency: 'XOF',
    is_active: true,
    folder_name: ''
  })

  // État pour la configuration avancée
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [templateConfig, setTemplateConfig] = useState({
    fonts: {
      heading: 'Arial',
      body: 'Arial'
    },
    colors: {
      primary: '#000000',
      secondary: '#FFFFFF',
      accent: '#333333'
    },
    layout: {
      twoColumn: false,
      margins: '15mm'
    },
    sections: [
      { type: 'contact', label: 'Contact', columns: 1, required: true },
      { type: 'summary', label: 'Résumé', columns: 1, required: false },
      { type: 'experience', label: 'Expériences Professionnelles', columns: 1, required: false },
      { type: 'education', label: 'Formation', columns: 1, required: false },
      { type: 'skills', label: 'Compétences', columns: 1, required: false },
      { type: 'languages', label: 'Langues', columns: 1, required: false }
    ]
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleConfigChange = (category: string, field: string, value: any) => {
    setTemplateConfig(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [field]: value
      }
    }))
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name),
      folder_name: generateSlug(name)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session?.user?.accessToken) {
      setError('Token d\'authentification non trouvé')
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const payload = {
        ...formData,
        definition: templateConfig
      }

      const response = await fetch(`${config.apiBaseUrl}/admin/templates/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Erreur lors de la création du template')
      }

      setSuccess('Template créé avec succès!')
      
      // Rediriger après un court délai
      setTimeout(() => {
        router.push('/admin/templates')
        router.refresh()
      }, 1500)
      
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Retour
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Créer un nouveau template</h1>
                <p className="text-sm text-gray-500">Configurez un modèle de CV personnalisé</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informations principales */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Informations principales</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nom du template *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleNameChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Template Moderne"
                  />
                </div>

                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                    Slug *
                  </label>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    required
                    value={formData.slug}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    placeholder="template-moderne"
                  />
                  <p className="mt-1 text-xs text-gray-500">Identifiant unique utilisé dans les URLs</p>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Description détaillée du template..."
                />
              </div>

              <div>
                <label htmlFor="folder_name" className="block text-sm font-medium text-gray-700">
                  Nom du dossier *
                </label>
                <input
                  type="text"
                  id="folder_name"
                  name="folder_name"
                  required
                  value={formData.folder_name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder="template-moderne"
                />
                <p className="mt-1 text-xs text-gray-500">Nom du dossier qui contiendra les fichiers du template</p>
              </div>
            </div>
          </div>

          {/* Tarification */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Tarification</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Prix *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="number"
                      id="price"
                      name="price"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                    Devise
                  </label>
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="XOF">XOF (FCFA)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="USD">USD (Dollar)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Statut */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Statut</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center">
                <input
                  id="is_active"
                  name="is_active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  Template actif
                </label>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Les templates actifs sont disponibles pour les utilisateurs finaux.
              </p>
            </div>
          </div>

          {/* Configuration avancée */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Configuration avancée</h2>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {showAdvanced ? 'Masquer' : 'Afficher'}
                </button>
              </div>
            </div>
            
            {showAdvanced && (
              <div className="p-6 space-y-6">
                {/* Polices */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Typographie</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Titres</label>
                      <select
                        value={templateConfig.fonts.heading}
                        onChange={(e) => handleConfigChange('fonts', 'heading', e.target.value)}
                        className="block w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Arial">Arial</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Verdana">Verdana</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Corps de texte</label>
                      <select
                        value={templateConfig.fonts.body}
                        onChange={(e) => handleConfigChange('fonts', 'body', e.target.value)}
                        className="block w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Arial">Arial</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Verdana">Verdana</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Couleurs */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Palette de couleurs</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(templateConfig.colors).map(([key, color]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={color as string}
                          onChange={(e) => handleConfigChange('colors', key, e.target.value)}
                          className="h-8 w-8 border border-gray-300 rounded cursor-pointer"
                        />
                        <div>
                          <div className="text-xs text-gray-600 capitalize">{key}</div>
                          <div className="text-xs font-mono text-gray-500">{color}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Layout */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Mise en page</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="twoColumn"
                        checked={templateConfig.layout.twoColumn}
                        onChange={(e) => handleConfigChange('layout', 'twoColumn', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="twoColumn" className="ml-2 text-sm text-gray-900">
                        Mise en page deux colonnes
                      </label>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Marges</label>
                      <select
                        value={templateConfig.layout.margins}
                        onChange={(e) => handleConfigChange('layout', 'margins', e.target.value)}
                        className="block w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="10mm">10mm</option>
                        <option value="15mm">15mm</option>
                        <option value="20mm">20mm</option>
                        <option value="25mm">25mm</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Création en cours...
                </>
              ) : (
                'Créer le template'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
