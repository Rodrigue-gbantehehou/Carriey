'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'

export default function UploadTemplatePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: ''
  })
  const [files, setFiles] = useState({
    template_json: null as File | null,
    style_css: null as File | null,
    template_jinja2: null as File | null,
    preview_image: null as File | null
  })

  // Vérifier l'authentification
  if (status === 'loading') {
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
        <button
          onClick={() => router.push('/login')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Se connecter
        </button>
      </div>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
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

  const validateFiles = () => {
    const required = ['template_json', 'style_css', 'template_jinja2']
    const missing = required.filter(key => !files[key as keyof typeof files])
    
    if (missing.length > 0) {
      toast.error(`Veuillez fournir les fichiers requis: ${missing.join(', ')}`)
      return false
    }

    // Valider le nom du fichier JSON
    if (files.template_json && !files.template_json.name.endsWith('.json')) {
      toast.error('Le fichier template doit être au format .json')
      return false
    }

    // Valider le fichier CSS
    if (files.style_css && !files.style_css.name.endsWith('.css')) {
      toast.error('Le fichier de style doit être au format .css')
      return false
    }

    // Valider le fichier Jinja2
    if (files.template_jinja2 && !files.template_jinja2.name.endsWith('.jinja2')) {
      toast.error('Le fichier template doit être au format .jinja2')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateFiles()) {
      return
    }

    setLoading(true)

    if (!session?.user?.accessToken) {
      toast.error('Token d\'authentification non trouvé')
      setLoading(false)
      return
    }

    try {
      const uploadFormData = new FormData()

      // Ajouter les champs du formulaire
      uploadFormData.append('name', formData.name)
      uploadFormData.append('slug', formData.slug)
      uploadFormData.append('description', formData.description)

      // Ajouter les fichiers
      if (files.template_json) uploadFormData.append('template_json', files.template_json)
      if (files.style_css) uploadFormData.append('style_css', files.style_css)
      if (files.template_jinja2) uploadFormData.append('template_jinja2', files.template_jinja2)
      if (files.preview_image) uploadFormData.append('preview_image', files.preview_image)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/templates/upload/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`
        },
        body: uploadFormData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Erreur lors de la création du template')
      }

      const newTemplate = await response.json()
      toast.success('Template créé avec succès!')
      router.push('/admin/templates')
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création du template')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Upload Template</h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations du template */}
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
                onChange={handleInputChange}
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
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: moderne"
              />
              <p className="mt-1 text-sm text-gray-500">
                Identifiant unique (sans espaces, en minuscules)
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Description du template..."
            />
          </div>

          {/* Fichiers du template */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Fichiers du template</h3>
            
            <div className="space-y-4">
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
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Fichier de configuration JSON du template
                </p>
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
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Feuille de styles CSS
                </p>
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
                  accept=".jinja2"
                  onChange={handleFileChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Template Jinja2 pour la structure HTML
                </p>
              </div>

              <div>
                <label htmlFor="preview_image" className="block text-sm font-medium text-gray-700">
                  Image de prévisualisation
                </label>
                <input
                  type="file"
                  id="preview_image"
                  name="preview_image"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Image pour la prévisualisation (optionnel)
                </p>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Créer le template'}
            </button>
          </div>
        </form>
      </div>

      {/* Guide de structure */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4">📋 Guide de structure</h3>
        <div className="space-y-3 text-sm text-blue-800">
          <div>
            <strong>template.json:</strong> Contient la configuration (nom, polices, couleurs, sections)
          </div>
          <div>
            <strong>style.css:</strong> Styles CSS pour le template (compatible impression PDF)
          </div>
          <div>
            <strong>template.jinja2:</strong> Structure HTML avec variables Jinja2
          </div>
          <div className="mt-4">
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL}/admin/templates/upload/template-structure`}
              target="_blank"
              className="text-blue-600 underline hover:text-blue-800"
            >
              Voir la structure complète requise →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
