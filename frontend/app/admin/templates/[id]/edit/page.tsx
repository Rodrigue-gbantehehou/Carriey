'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import config from '@/lib/config'
import { ArrowLeft, CheckCircle2, AlertCircle, Settings, DollarSign, Image as ImageIcon, Code, Play, Upload, Info } from 'lucide-react'
import { usePlans } from '@/lib/hooks/usePlans'

export default function EditTemplatePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = useParams()
  
  const { getPlanByCode } = usePlans()
  const singlePlan = getPlanByCode('single')

  const [template, setTemplate] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '0',
    currency: 'XOF',
    preview_image: '',
    folder_name: '',
    template_type: 'cv',
    is_active: true
  })

  // Charger le template
  useEffect(() => {
    const fetchTemplate = async () => {
      if (!session?.user?.accessToken || !id) return
      try {
        const response = await fetch(`${config.apiBaseUrl}/admin/templates/${id}`, {
          headers: { 'Authorization': `Bearer ${session.user.accessToken}` }
        })
        if (!response.ok) throw new Error('Template non trouvé')
        const data = await response.json()
        setTemplate(data)
        setFormData({
          name: data.name || '',
          slug: data.slug || '',
          description: data.description || '',
          price: data.price ? String(data.price) : '0',
          currency: data.currency || 'XOF',
          preview_image: data.preview_image || '',
          folder_name: data.folder_name || '',
          template_type: data.template_type || 'cv',
          is_active: data.is_active !== false
        })
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement du template')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTemplate()
  }, [id, session])

  useEffect(() => {
    if (singlePlan && formData.price !== '0' && (parseFloat(formData.price) !== singlePlan.price || formData.currency !== singlePlan.currency)) {
      setFormData(prev => ({
        ...prev,
        price: String(singlePlan.price),
        currency: singlePlan.currency
      }))
    }
  }, [singlePlan, formData.price, formData.currency])

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
      const response = await fetch(`${config.apiBaseUrl}/admin/templates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`
        },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          price: parseFloat(formData.price) || 0,
          currency: formData.currency,
          preview_image: formData.preview_image || null,
          folder_name: formData.folder_name || null,
          template_type: formData.template_type,
          is_active: formData.is_active
        })
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.detail || 'Erreur lors de la mise à jour')
      }

      const updated = await response.json()
      setTemplate(updated)
      setSuccess('Modifications enregistrées avec succès !')
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGeneratePreview = async () => {
    if (!session?.user?.accessToken) return
    setIsGeneratingPreview(true)
    setError(null)
    
    try {
      // Simulation d'une capture Playwright ou appel API
      const response = await fetch(`${config.apiBaseUrl}/admin/templates/${id}/generate-preview`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la génération de la miniature')
      }

      const data = await response.json()
      setFormData(prev => ({ ...prev, preview_image: data.preview_url }))
      setSuccess('Miniature générée avec succès !')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsGeneratingPreview(false)
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
      setSuccess('Image uploadée avec succès ! Pensez à enregistrer le modèle.')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsUploading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  if (!template) {
    return (
      <div className="bg-white border border-gray-200 rounded-md p-8 text-center max-w-md mx-auto mt-12">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Modèle introuvable</h2>
        <p className="text-gray-500 text-sm mb-6">Le modèle demandé n'existe pas ou a été supprimé.</p>
        <button
          onClick={() => router.push('/admin/templates')}
          className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-md text-sm font-medium transition-colors"
        >
          Retour à la liste des modèles
        </button>
      </div>
    )
  }

  const isFree = parseFloat(formData.price) === 0
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
            <span className="text-xl font-semibold text-gray-900">{template.name}</span>
            <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded border border-gray-200">
              {template.slug}
            </span>
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
          <a
            href={`/mes-documents/create/${formData.template_type === 'cover_letter' ? 'lettre' : formData.template_type === 'public_page' ? 'page-publique' : 'cv'}?template=${formData.slug || template.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors"
          >
            <Play className="w-4 h-4" /> Tester dans l'éditeur
          </a>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50"
          >
            {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
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
                  onChange={handleInputChange}
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
                  Correspond au composant React <code className="text-gray-600 font-mono">@/components/app/.../templates/{formData.folder_name || formData.slug || 'dossier'}</code>
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
                    Rendre ce modèle sélectionnable dans l'éditeur et visible sur /modeles
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

        {/* ── Right Column: Visual & Preview (5 cols) ── */}
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
                  <p className="text-xs font-semibold text-gray-600">Aucune miniature enregistrée</p>
                  <p className="text-[11px] text-gray-400 mt-1">Générez une capture automatique ci-dessous</p>
                </div>
              )}

              {/* Overlay hover action */}
              <div className="absolute inset-0 bg-gray-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <a
                  href={`/mes-documents/create/${formData.template_type === 'cover_letter' ? 'lettre' : formData.template_type === 'public_page' ? 'page-publique' : 'cv'}?template=${formData.slug || template.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-white text-gray-900 rounded-md text-xs font-semibold shadow-lg hover:bg-gray-50 transition-colors"
                >
                  Ouvrir dans l'éditeur
                </a>
              </div>
            </div>

            {/* Actions: Upload & Playwright */}
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
                  disabled={isUploading || isGeneratingPreview}
                />
              </label>

              <button
                type="button"
                onClick={handleGeneratePreview}
                disabled={isGeneratingPreview || isUploading}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-semibold rounded-md transition-colors border border-gray-200 disabled:opacity-50"
              >
                {isGeneratingPreview ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
                    <span>Capture en cours...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Régénérer automatiquement (Playwright)</span>
                  </>
                )}
              </button>

              <div className="pt-3 border-t border-gray-100">
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                  Ou renseigner manuellement l'URL :
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
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span>Version :</span>
                <span className="font-mono text-gray-900 text-xs mt-0.5">v{template.version || 1}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Dernière mise à jour :</span>
                <span className="text-gray-900 text-xs mt-0.5">
                  {template.updated_at ? new Date(template.updated_at).toLocaleDateString('fr-FR') : 'N/A'}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
              <Link
                href="/modeles"
                target="_blank"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Voir sur le catalogue public
              </Link>
              <Link
                href={`/print?template=${formData.slug || template.slug}`}
                target="_blank"
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                Tester vue print
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}