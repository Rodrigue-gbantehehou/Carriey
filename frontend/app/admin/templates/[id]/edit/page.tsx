'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import config from '@/lib/config'

export default function EditTemplatePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = useParams()

  const [template, setTemplate] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '0',
    currency: 'XOF',
    preview_image: '',
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
          is_active: formData.is_active
        })
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.detail || 'Erreur lors de la mise à jour')
      }

      const updated = await response.json()
      setTemplate(updated)
      setSuccess('Modèle enregistré avec succès !')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la sauvegarde')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Génération automatique de la miniature via Playwright
  const handleGeneratePreview = async () => {
    if (!session?.user?.accessToken || !id) return
    setIsGeneratingPreview(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`${config.apiBaseUrl}/admin/templates/${id}/generate-preview`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`
        }
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.detail || 'Erreur lors de la génération de la miniature')
      }

      const resData = await response.json()
      const refreshedUrl = `${resData.preview_image}?t=${Date.now()}`
      setFormData(prev => ({ ...prev, preview_image: resData.preview_image }))
      setTemplate((prev: any) => ({ ...prev, preview_image: refreshedUrl }))
      setSuccess('Miniature haute fidélité générée avec succès !')
      setTimeout(() => setSuccess(null), 4000)
    } catch (err: any) {
      setError(err.message || 'Impossible de générer la miniature')
    } finally {
      setIsGeneratingPreview(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400 text-sm">Chargement des paramètres du modèle...</p>
        </div>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl text-center max-w-md">
          <div className="w-12 h-12 rounded-full bg-red-900/30 text-red-400 flex items-center justify-center mx-auto mb-4 text-xl">⚠️</div>
          <h2 className="text-lg font-bold text-white mb-2">Modèle introuvable</h2>
          <p className="text-gray-400 text-sm mb-6">Le modèle demandé n&apos;existe pas ou a été supprimé.</p>
          <button
            onClick={() => router.push('/admin/templates')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Retour à la liste des modèles
          </button>
        </div>
      </div>
    )
  }

  const isFree = parseFloat(formData.price) === 0
  const previewSrc = formData.preview_image
    ? (formData.preview_image.startsWith('http') ? formData.preview_image : `${config.apiBaseUrl}${formData.preview_image}`)
    : null

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans">
      {/* ── Top Header ── */}
      <header className="sticky top-0 z-30 bg-gray-900/90 backdrop-blur border-b border-gray-800 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/templates"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors bg-gray-800 hover:bg-gray-700 px-2.5 py-1.5 rounded-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Modèles
          </Link>
          <div className="h-4 w-px bg-gray-700" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{template.name}</span>
            <span className="text-xs font-mono bg-gray-800 text-gray-400 px-2 py-0.5 rounded border border-gray-700">
              {template.slug}
            </span>
            {formData.is_active ? (
              <span className="text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Actif
              </span>
            ) : (
              <span className="text-[11px] font-medium bg-gray-800 text-gray-500 border border-gray-700 px-2 py-0.5 rounded-full">
                Inactif
              </span>
            )}
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${isFree ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-purple-500/10 text-purple-300 border border-purple-500/20'}`}>
              {isFree ? 'Gratuit' : `${formData.price} ${formData.currency}`}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <a
            href={`/editor?template=${formData.slug || template.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-400 bg-blue-950/40 hover:bg-blue-900/50 border border-blue-800 rounded-lg transition-colors"
          >
            <span>🚀</span> Tester dans l&apos;éditeur
          </a>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
          >
            {isSubmitting && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </header>

      {/* Notifications */}
      {success && (
        <div className="bg-emerald-950/80 border-b border-emerald-800/80 text-emerald-200 px-6 py-2.5 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="text-emerald-400 hover:text-white text-xs">✕</button>
        </div>
      )}
      {error && (
        <div className="bg-red-950/80 border-b border-red-800/80 text-red-200 px-6 py-2.5 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* ── Main Container ── */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── Left Column: Form Settings (7 cols) ── */}
          <div className="lg:col-span-7 space-y-6">
            {/* Card: Commercial Info */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                <span>📝</span> Paramètres Commerciaux
              </h2>
              <p className="text-xs text-gray-400 mb-5">
                Configurez le nom et la description présentés aux candidats dans le catalogue public.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Nom d&apos;affichage du modèle <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ex: Moderne Professionnel"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Identifiant technique (Slug) <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="slug"
                      required
                      value={formData.slug}
                      onChange={handleInputChange}
                      placeholder="moderne"
                      className="w-full bg-gray-800/80 border border-gray-700 rounded-xl px-3.5 py-2.5 font-mono text-xs text-gray-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Correspond au composant React <code className="text-blue-400">@/components/cv-templates/{formData.slug || 'slug'}</code>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Description commerciale
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Ex: Idéal pour les profils techniques, cadres et ingénieurs. Mise en page optimisée ATS avec hiérarchie claire."
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Card: Pricing & Status */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                <span>💰</span> Tarification & Visibilité
              </h2>
              <p className="text-xs text-gray-400 mb-5">
                Définissez le modèle économique et le statut d&apos;affichage dans l&apos;application.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">Prix d&apos;export</label>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="50"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">Devise</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="XOF">XOF (Franc CFA)</option>
                    <option value="EUR">EUR (€ Euro)</option>
                    <option value="USD">USD ($ Dollar)</option>
                  </select>
                </div>
              </div>

              {/* Free template hint */}
              {isFree ? (
                <div className="bg-blue-950/30 border border-blue-800/40 rounded-xl p-3.5 mb-5 flex items-start gap-2.5 text-xs text-blue-300">
                  <span className="text-blue-400 text-sm">💡</span>
                  <span>
                    <strong>Modèle Gratuit :</strong> Ce modèle sera immédiatement téléchargeable en 1 clic pour tous les utilisateurs sans aucune barrière de paiement.
                  </span>
                </div>
              ) : (
                <div className="bg-purple-950/30 border border-purple-800/40 rounded-xl p-3.5 mb-5 flex items-start gap-2.5 text-xs text-purple-300">
                  <span className="text-purple-400 text-sm">🔒</span>
                  <span>
                    <strong>Modèle Premium :</strong> Le candidat paiera {formData.price} {formData.currency} via Mobile Money (FedaPay / KkiaPay) avant de générer son PDF haute fidélité.
                  </span>
                </div>
              )}

              {/* Status Toggle */}
              <div className="pt-2 border-t border-gray-800/60">
                <label className="flex items-center justify-between cursor-pointer py-1">
                  <div>
                    <span className="text-sm font-medium text-white block">Statut de publication</span>
                    <span className="text-xs text-gray-400 block">
                      Rendre ce modèle sélectionnable dans l&apos;éditeur et visible sur /modeles
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
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </div>
                </label>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2">
              <Link
                href="/admin/templates"
                className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700 rounded-xl transition-colors"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md hover:shadow-blue-600/20 disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
              </button>
            </div>
          </div>

          {/* ── Right Column: Visual & Preview (5 cols) ── */}
          <div className="lg:col-span-5 space-y-6">
            {/* Card: Thumbnail Preview */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                    <span>🖼️</span> Miniature du Modèle
                  </h2>
                  <p className="text-xs text-gray-400">
                    Aperçu présenté aux candidats dans le catalogue
                  </p>
                </div>
              </div>

              {/* Thumbnail Display Box */}
              <div className="aspect-[1/1.414] w-full max-w-[320px] mx-auto bg-gray-950 rounded-xl border border-gray-800 overflow-hidden shadow-inner flex items-center justify-center relative group">
                {previewSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewSrc}
                    alt={`Aperçu du modèle ${formData.name}`}
                    className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-600 stroke-[1.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs font-medium text-gray-400">Aucune miniature enregistrée</p>
                    <p className="text-[11px] text-gray-600 mt-1">Générez une capture automatique ci-dessous</p>
                  </div>
                )}

                {/* Overlay hover action */}
                <div className="absolute inset-0 bg-gray-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <a
                    href={`/editor?template=${formData.slug || template.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium shadow-lg hover:bg-blue-500 transition-colors"
                  >
                    Ouvrir dans l&apos;éditeur
                  </a>
                </div>
              </div>

              {/* Automatic Generation Button */}
              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  onClick={handleGeneratePreview}
                  disabled={isGeneratingPreview}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isGeneratingPreview ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Capture Playwright en cours...</span>
                    </>
                  ) : (
                    <>
                      <span>⚡</span>
                      <span>Régénérer la miniature avec Playwright</span>
                    </>
                  )}
                </button>

                <div className="pt-2">
                  <label className="block text-[11px] font-medium text-gray-400 mb-1">
                    Ou renseigner manuellement l&apos;URL de l&apos;image :
                  </label>
                  <input
                    type="text"
                    name="preview_image"
                    value={formData.preview_image}
                    onChange={handleInputChange}
                    placeholder="/static/previews/moderne.png"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 font-mono text-xs text-gray-300 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Card: Architecture & React Info */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <span>⚛️</span> Architecture Modèle React
              </h2>
              <div className="space-y-2.5 text-xs text-gray-400">
                <div className="flex justify-between py-1 border-b border-gray-800">
                  <span>Moteur de rendu :</span>
                  <span className="font-mono text-white">Next.js 14 WYSIWYG</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-800">
                  <span>Moteur PDF :</span>
                  <span className="font-mono text-white">Playwright Headless</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-800">
                  <span>Version :</span>
                  <span className="font-mono text-gray-300">v{template.version || 1}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Dernière mise à jour :</span>
                  <span className="text-gray-300">
                    {template.updated_at ? new Date(template.updated_at).toLocaleDateString('fr-FR') : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-800 flex justify-between">
                <Link
                  href="/modeles"
                  target="_blank"
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                  <span>↗</span> Voir sur le catalogue public
                </Link>
                <Link
                  href={`/print?template=${formData.slug || template.slug}`}
                  target="_blank"
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Tester vue print
                </Link>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}