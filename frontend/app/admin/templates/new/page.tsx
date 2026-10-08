'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import config from '@/lib/config'
import { ArrowLeft, CheckCircle2, AlertCircle, Settings, DollarSign, Info, Code, Image as ImageIcon, Upload } from 'lucide-react'
import { usePlans } from '@/lib/hooks/usePlans'

export default function NewTemplatePage() {
  const { data: session } = useSession()
  const router = useRouter()
  
  const { getPlanByCode } = usePlans()
  const singlePlan = getPlanByCode('single')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '0',
    currency: 'XOF',
    is_active: false,
    folder_name: '',
    template_type: 'cv',
    preview_image: ''
  })

  // Synchronise le prix du nouveau template (Premium par défaut ou Gratuit si 0)
  useEffect(() => {
    if (singlePlan && formData.price !== '0' && formData.price === '') {
      setFormData(prev => ({
        ...prev,
        price: String(singlePlan.price),
        currency: singlePlan.currency
      }))
    }
  }, [singlePlan, formData.price])

  const [templateConfig, setTemplateConfig] = useState({
    fonts: { heading: 'Arial', body: 'Arial' },
    colors: { primary: '#000000', secondary: '#FFFFFF', accent: '#333333' },
    layout: { twoColumn: false, margins: '15mm' },
    sections: [
      { type: 'contact', label: 'Contact', columns: 1, required: true },
      { type: 'summary', label: 'Résumé', columns: 1, required: false },
      { type: 'experience', label: 'Expériences Professionnelles', columns: 1, required: false },
      { type: 'education', label: 'Formation', columns: 1, required: false },
      { type: 'skills', label: 'Compétences', columns: 1, required: false },
      { type: 'languages', label: 'Langues', columns: 1, required: false }
    ]
  })

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.accessToken) return
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        preview_image: formData.preview_image || null,
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

      setSuccess('Template créé avec succès ! Redirection...')
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !session?.user?.accessToken) return

    setIsUploading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch(`${config.apiBaseUrl}/admin/templates/upload-preview`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`
        },
        body: formData
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Erreur lors de l\'upload')
      }
      
      const data = await response.json()
      setFormData(prev => ({ ...prev, preview_image: data.preview_url }))
      setSuccess('Image uploadée avec succès !')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsUploading(false)
    }
  }

  const isFree = parseFloat(formData.price) === 0 || formData.price === ''
  const previewSrc = formData.preview_image
    ? (formData.preview_image.startsWith('http') ? formData.preview_image : `${config.staticBaseUrl}${formData.preview_image.replace('/static', '')}`)
    : null

  return (
    <div className="space-y-6">
      {/* ── Top Header ── */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/templates"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>
          <div className="h-5 w-px bg-gray-300" />
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-900">Nouveau Modèle</h1>
            {formData.is_active ? (
              <span className="text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                Actif
              </span>
            ) : (
              <span className="text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-full">
                Inactif
              </span>
            )}
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${isFree ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
              {isFree ? 'Gratuit' : `${formData.price} ${formData.currency}`}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50"
          >
            {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {isSubmitting ? 'Création...' : 'Créer le modèle'}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-md text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <p className="font-medium">{success}</p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* ── Main Container ── */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Left Column: Form Settings (7 cols) ── */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Commercial Info */}
          <div className="bg-white border border-gray-200 rounded-md p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <Settings className="w-4 h-4 text-gray-500" /> Paramètres Commerciaux
            </h2>
            <p className="text-xs text-gray-500 mb-5">
              Configurez le nom et la description présentés aux candidats dans le catalogue public.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nom d'affichage du modèle <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="Ex: Moderne Professionnel"
                  className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Identifiant technique (Slug) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="slug"
                    required
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="lettre-classique"
                    className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-2 font-mono text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Identifiant URL (doit être unique)
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nom du dossier React <span className="text-gray-400">(optionnel)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="folder_name"
                    value={formData.folder_name}
                    onChange={handleInputChange}
                    placeholder="classique"
                    className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-2 font-mono text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Dossier physique. Si vide, utilise le slug. Correspond à <code className="text-gray-600 font-mono">@/components/app/.../templates/dossier</code>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Type de document <span className="text-red-500">*</span>
                </label>
                <select
                  name="template_type"
                  value={formData.template_type}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                  <option value="cv">CV</option>
                  <option value="cover_letter">Lettre de motivation</option>
                  <option value="public_page">Profil Public (Page Web)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description commerciale
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Ex: Idéal pour les profils techniques..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Card: Pricing & Status */}
          <div className="bg-white border border-gray-200 rounded-md p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" /> Tarification & Visibilité
            </h2>
            <p className="text-xs text-gray-500 mb-5">
              Définissez le modèle économique et le statut d'affichage dans l'application.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Prix d'export</label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="50"
                  value={formData.price === '0' ? '0' : (singlePlan?.price || formData.price)}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200 opacity-70 cursor-not-allowed"
                  placeholder="0"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Devise</label>
                <select
                  name="currency"
                  value={formData.price === '0' ? formData.currency : (singlePlan?.currency || formData.currency)}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200 opacity-70 cursor-not-allowed"
                  disabled
                >
                  <option value="XOF">XOF (Franc CFA)</option>
                  <option value="EUR">EUR (€ Euro)</option>
                  <option value="USD">USD ($ Dollar)</option>
                </select>
              </div>
            </div>

            {/* Free template hint */}
            {isFree ? (
              <div className="bg-sky-50 border border-sky-100 rounded-md p-3.5 mb-5 flex items-start gap-2.5 text-xs text-sky-800">
                <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Modèle Gratuit :</strong> Ce modèle sera immédiatement téléchargeable en 1 clic pour tous les utilisateurs sans aucune barrière de paiement.
                </span>
              </div>
            ) : (
              <div className="bg-purple-50 border border-purple-100 rounded-md p-3.5 mb-5 flex items-start gap-2.5 text-xs text-purple-800">
                <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Modèle Premium :</strong> Le candidat paiera {singlePlan?.price || formData.price} {singlePlan?.currency || formData.currency} (Défini par le plan Achat Unique) via Mobile Money avant de générer son PDF.
                </span>
              </div>
            )}

            {/* Status Toggle */}
            <div className="pt-4 border-t border-gray-100">
              <label className="flex items-center justify-between cursor-pointer py-1">
                <div>
                  <span className="text-sm font-semibold text-gray-900 block">Statut de publication</span>
                  <span className="text-xs text-gray-500 block mt-0.5">
                    Rendre ce modèle sélectionnable immédiatement.
                  </span>
                </div>
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gray-900"></div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* ── Right Column: Info & Preview (5 cols) ── */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Thumbnail Preview */}
          <div className="bg-white border border-gray-200 rounded-md p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-gray-500" /> Miniature du Modèle
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Aperçu présenté aux candidats dans le catalogue
                </p>
              </div>
            </div>

            {/* Thumbnail Display Box */}
            <div className="aspect-[1/1.414] w-full max-w-[320px] mx-auto bg-gray-50 rounded-md border border-gray-200 overflow-hidden flex items-center justify-center relative group">
              {previewSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewSrc}
                  alt={`Aperçu du modèle ${formData.name}`}
                  className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <ImageIcon className="w-10 h-10 mx-auto mb-3 text-gray-300 stroke-[1.5]" />
                  <p className="text-xs font-semibold text-gray-600">Aucune miniature</p>
                  <p className="text-[11px] text-gray-400 mt-1">Renseignez une URL d'image ci-dessous</p>
                </div>
              )}
            </div>

            {/* Upload Button */}
            <div className="mt-5 space-y-4">
              <label className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-semibold rounded-md transition-colors cursor-pointer border border-gray-200 disabled:opacity-50">
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                    <span>Upload en cours...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Uploader une image</span>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>

              <div className="pt-3 border-t border-gray-100">
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                  Ou renseigner manuellement l'URL de l'image :
                </label>
                <input
                  type="text"
                  name="preview_image"
                  value={formData.preview_image}
                  onChange={handleInputChange}
                  placeholder="/static/previews/moderne.png"
                  className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-2 font-mono text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>
            </div>
          </div>

          {/* Card: Architecture & React Info */}
          <div className="bg-white border border-gray-200 rounded-md p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Code className="w-4 h-4 text-gray-500" /> Architecture Modèle React
            </h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span>Moteur de rendu :</span>
                <span className="font-mono text-gray-900 text-xs mt-0.5">Next.js 14 WYSIWYG</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span>Moteur PDF :</span>
                <span className="font-mono text-gray-900 text-xs mt-0.5">Playwright Headless</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
