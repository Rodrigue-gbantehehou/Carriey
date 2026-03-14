'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import config from '@/lib/config'

export default function CreateTemplatePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Mode de création : 'config' ou 'upload'
  const [creationMode, setCreationMode] = useState<'config' | 'upload'>('config')

  // État du formulaire pour le mode configuration
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    currency: 'XOF',
    is_active: true
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

  // État pour le mode upload
  const [uploadData, setUploadData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    currency: 'XOF',
    is_active: true
  })

  const [files, setFiles] = useState({
    template_json: null as File | null,
    style_css: null as File | null,
    template_jinja2: null as File | null,
    preview_image: null as File | null
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

  const handleUploadInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      setUploadData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }))
    } else {
      setUploadData(prev => ({
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
      slug: generateSlug(name)
    }))
  }


  const handleUploadNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setUploadData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target
    if (files && files[0]) {
      setFiles(prev => ({
        ...prev,
        [name]: files[0]
      }))
    }
  }

  // Soumission mode configuration
  const handleConfigSubmit = async (e: React.FormEvent) => {
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
        price: parseFloat(formData.price) || 0,
        folder_name: formData.slug,
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
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Erreur lors de la création du template')
      }

      const data = await response.json()
      setSuccess('Template créé avec succès ! Préparation de l\'éditeur...')

      setTimeout(() => {
        if (data && data.id) {
          router.push(`/admin/templates/${data.id}/edit`)
        } else {
          router.push('/admin/templates')
        }
        router.refresh()
      }, 1500)

    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Soumission mode upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user?.accessToken) {
      setError('Token d\'authentification non trouvé')
      return
    }

    // Vérifier les fichiers requis
    if (!files.template_json || !files.style_css || !files.template_jinja2) {
      setError('Les fichiers template.json, style.css et template.jinja2 sont obligatoires')
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const uploadFormData = new FormData()

      // Ajouter les données du formulaire
      uploadFormData.append('name', uploadData.name)
      uploadFormData.append('slug', uploadData.slug)
      uploadFormData.append('description', uploadData.description)
      uploadFormData.append('price', uploadData.price)
      uploadFormData.append('currency', uploadData.currency)
      uploadFormData.append('is_active', uploadData.is_active.toString())

      // Ajouter les fichiers
      if (files.template_json) uploadFormData.append('template_json', files.template_json)
      if (files.style_css) uploadFormData.append('style_css', files.style_css)
      if (files.template_jinja2) uploadFormData.append('template_jinja2', files.template_jinja2)
      if (files.preview_image) uploadFormData.append('preview_image', files.preview_image)

      const response = await fetch(`${config.apiBaseUrl}/admin/templates/upload/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`
        },
        body: uploadFormData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Erreur lors de la création du template')
      }

      setSuccess('Template créé avec succès!')

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
                <h1 className="text-2xl font-bold text-gray-900">Créer un template</h1>
                <p className="text-sm text-gray-500">Configurez ou uploadez un modèle de CV</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Sélecteur de mode */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Choisissez votre méthode de création</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setCreationMode('config')}
                className={`p-4 border rounded-lg text-left transition-colors ${creationMode === 'config'
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                  : 'border-gray-300 hover:border-gray-400 bg-white'
                  }`}
              >
                <div className="flex items-center mb-2">
                  <svg className={`w-6 h-6 mr-3 ${creationMode === 'config' ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  <h3 className={`font-semibold ${creationMode === 'config' ? 'text-blue-900' : 'text-gray-900'}`}>
                    Configuration guidée
                  </h3>
                </div>
                <p className={`text-sm ${creationMode === 'config' ? 'text-blue-700' : 'text-gray-600'}`}>
                  Créez un template avec l'assistant de configuration. Idéal pour débuter.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setCreationMode('upload')}
                className={`p-4 border rounded-lg text-left transition-colors ${creationMode === 'upload'
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                  : 'border-gray-300 hover:border-gray-400 bg-white'
                  }`}
              >
                <div className="flex items-center mb-2">
                  <svg className={`w-6 h-6 mr-3 ${creationMode === 'upload' ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <h3 className={`font-semibold ${creationMode === 'upload' ? 'text-blue-900' : 'text-gray-900'}`}>
                    Upload de fichiers
                  </h3>
                </div>
                <p className={`text-sm ${creationMode === 'upload' ? 'text-blue-700' : 'text-gray-600'}`}>
                  Uploadez vos propres fichiers template.json, style.css et template.jinja2.
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Formulaire selon le mode choisi */}
        {creationMode === 'config' ? (
          <form onSubmit={handleConfigSubmit} className="space-y-8">
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
        ) : (
          <form onSubmit={handleUploadSubmit} className="space-y-8">
            {/* Informations du template */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Informations du template</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="upload_name" className="block text-sm font-medium text-gray-700">
                      Nom du template *
                    </label>
                    <input
                      type="text"
                      id="upload_name"
                      name="name"
                      required
                      value={uploadData.name}
                      onChange={handleUploadNameChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Template Moderne"
                    />
                  </div>

                  <div>
                    <label htmlFor="upload_slug" className="block text-sm font-medium text-gray-700">
                      Slug *
                    </label>
                    <input
                      type="text"
                      id="upload_slug"
                      name="slug"
                      required
                      value={uploadData.slug}
                      onChange={handleUploadInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                      placeholder="template-moderne"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="upload_description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="upload_description"
                    name="description"
                    rows={4}
                    value={uploadData.description}
                    onChange={handleUploadInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Description détaillée du template..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="upload_price" className="block text-sm font-medium text-gray-700">
                      Prix *
                    </label>
                    <input
                      type="number"
                      id="upload_price"
                      name="price"
                      required
                      min="0"
                      step="0.01"
                      value={uploadData.price}
                      onChange={handleUploadInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label htmlFor="upload_currency" className="block text-sm font-medium text-gray-700">
                      Devise
                    </label>
                    <select
                      id="upload_currency"
                      name="currency"
                      value={uploadData.currency}
                      onChange={handleUploadInputChange}
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

            {/* Fichiers */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Fichiers du template</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="template_json" className="block text-sm font-medium text-gray-700">
                      template.json *
                    </label>
                    <input
                      type="file"
                      id="template_json"
                      name="template_json"
                      required
                      accept=".json"
                      onChange={handleFileChange}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="mt-1 text-xs text-gray-500">Fichier de configuration JSON</p>
                  </div>

                  <div>
                    <label htmlFor="style_css" className="block text-sm font-medium text-gray-700">
                      style.css *
                    </label>
                    <input
                      type="file"
                      id="style_css"
                      name="style_css"
                      required
                      accept=".css"
                      onChange={handleFileChange}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="mt-1 text-xs text-gray-500">Feuille de styles CSS</p>
                  </div>

                  <div>
                    <label htmlFor="template_jinja2" className="block text-sm font-medium text-gray-700">
                      template.jinja2 *
                    </label>
                    <input
                      type="file"
                      id="template_jinja2"
                      name="template_jinja2"
                      required
                      accept=".jinja2,.j2,.html"
                      onChange={handleFileChange}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="mt-1 text-xs text-gray-500">Template HTML Jinja2</p>
                  </div>

                  <div>
                    <label htmlFor="preview_image" className="block text-sm font-medium text-gray-700">
                      preview_image
                    </label>
                    <input
                      type="file"
                      id="preview_image"
                      name="preview_image"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="mt-1 text-xs text-gray-500">Image de prévisualisation (optionnel)</p>
                  </div>
                </div>

                {/* Aide */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Structure requise</h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <div className="mb-2">
                          <strong>template.json:</strong> Contient la configuration (nom, polices, couleurs, sections)
                        </div>
                        <div className="mb-2">
                          <strong>style.css:</strong> Styles CSS pour le template (compatible impression PDF)
                        </div>
                        <div className="mb-2">
                          <strong>template.jinja2:</strong> Structure HTML avec variables Jinja2
                        </div>
                        <div>
                          <a
                            href={`${config.apiBaseUrl}/admin/templates/upload/template-structure`}
                            target="_blank"
                            className="text-blue-600 underline hover:text-blue-800"
                          >
                            Voir la structure complète requise →
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                    Upload en cours...
                  </>
                ) : (
                  'Uploader le template'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div >
  )
}
