'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import config from '@/lib/config'

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

type CodeTab = 'json' | 'css' | 'jinja'
type MainTab = 'info' | 'code'

export default function EditTemplatePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = useParams()
  const [template, setTemplate] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSavingFiles, setIsSavingFiles] = useState(false)
  const [activeTab, setActiveTab] = useState<MainTab>('info')
  const [activeCodeTab, setActiveCodeTab] = useState<CodeTab>('jinja')
  const [showPreview, setShowPreview] = useState(true)
  const [previewHtml, setPreviewHtml] = useState<string>('')
  const [isRendering, setIsRendering] = useState(false)
  const [previewScale, setPreviewScale] = useState(0.6)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'XOF',
    is_active: true
  })

  const [fileContents, setFileContents] = useState({
    template_json: '',
    style_css: '',
    template_jinja2: ''
  })

  const debouncedFileContents = useDebounce(fileContents, 600)

  // Fetch template data
  useEffect(() => {
    const fetchTemplate = async () => {
      if (!session?.user?.accessToken) return
      try {
        const response = await fetch(`${config.apiBaseUrl}/admin/templates/${id}`, {
          headers: { 'Authorization': `Bearer ${session.user.accessToken}` }
        })
        if (!response.ok) throw new Error('Template non trouvé')
        const data = await response.json()
        setTemplate(data)
        setFormData({
          name: data.name || '',
          description: data.description || '',
          price: data.price || '0',
          currency: data.currency || 'XOF',
          is_active: data.is_active !== false
        })
      } catch (err) {
        setError('Erreur lors du chargement du template')
      } finally {
        setIsLoading(false)
      }
    }

    const fetchTemplateFiles = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/admin/templates/${id}/files`, {
          headers: { 'Authorization': `Bearer ${session?.user?.accessToken}` }
        })
        if (response.ok) {
          const files = await response.json()
          setFileContents(files)
        }
      } catch (err) {
        console.error('Erreur lors du chargement des fichiers:', err)
      }
    }

    if (id && session?.user?.accessToken) {
      fetchTemplate()
      fetchTemplateFiles()
    }
  }, [id, session])

  // Live preview: trigger on debounced file content changes
  useEffect(() => {
    if (!session?.user?.accessToken || activeTab !== 'code') return
    if (!debouncedFileContents.template_jinja2 && !debouncedFileContents.style_css) return

    const fetchPreview = async () => {
      setIsRendering(true)
      try {
        const response = await fetch(`${config.apiBaseUrl}/admin/templates/preview-live`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.user.accessToken}`
          },
          body: JSON.stringify({
            template_json: debouncedFileContents.template_json,
            style_css: debouncedFileContents.style_css,
            template_jinja2: debouncedFileContents.template_jinja2
          })
        })
        if (response.ok) {
          const html = await response.text()
          setPreviewHtml(html)
        }
      } catch (err) {
        console.error('Preview error:', err)
      } finally {
        setIsRendering(false)
      }
    }

    fetchPreview()
  }, [debouncedFileContents, session, activeTab])

  const handleInputChange = (e: any) => {
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
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`
        },
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Erreur lors de la mise à jour')
      }
      setSuccess('Template mis à jour avec succès!')
      setTimeout(() => { router.push('/admin/templates'); router.refresh() }, 1500)
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveFiles = async () => {
    if (!session?.user?.accessToken) return
    setIsSavingFiles(true)
    setError(null)
    setSuccess(null)
    try {
      const response = await fetch(`${config.apiBaseUrl}/admin/templates/${id}/files`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`
        },
        body: JSON.stringify(fileContents)
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Erreur lors de la sauvegarde')
      }
      setSuccess('Fichiers enregistrés ✓')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde')
    } finally {
      setIsSavingFiles(false)
    }
  }

  const handleFileContentChange = (tab: CodeTab, value: string) => {
    const key = tab === 'json' ? 'template_json' : tab === 'css' ? 'style_css' : 'template_jinja2'
    setFileContents(prev => ({ ...prev, [key]: value }))
  }

  const getLineCount = (tab: CodeTab) => {
    const content = tab === 'json' ? fileContents.template_json : tab === 'css' ? fileContents.style_css : fileContents.template_jinja2
    return content.split('\n').length
  }

  const currentContent = activeCodeTab === 'json' ? fileContents.template_json : activeCodeTab === 'css' ? fileContents.style_css : fileContents.template_jinja2

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-400 text-sm">Chargement du template...</p>
        </div>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Template non trouvé.</p>
          <button onClick={() => router.push('/admin/templates')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
            Retour aux templates
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ── Top Bar ── */}
      <header className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>
          <div className="w-px h-4 bg-gray-700" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-white font-semibold text-sm">{template.name}</span>
            <span className="text-gray-500 text-xs font-mono bg-gray-800 px-2 py-0.5 rounded">{template.slug}</span>
            {template.is_system && (
              <span className="text-xs bg-blue-900/50 text-blue-300 border border-blue-700 px-2 py-0.5 rounded-full">Système</span>
            )}
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'info' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            ⚙ Informations
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'code' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            {'</>'} Éditeur
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {success && (
            <span className="text-green-400 text-xs flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {success}
            </span>
          )}
          {error && (
            <span className="text-red-400 text-xs">{error}</span>
          )}
        </div>
      </header>

      {/* ── Main Content ── */}
      {activeTab === 'info' ? (
        /* ── Info Tab ── */
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">Informations</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Nom du template</label>
                    <input
                      type="text" name="name" required value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      placeholder="Ex: Template Moderne"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
                    <textarea
                      name="description" rows={3} value={formData.description}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                      placeholder="Description du template..."
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">Tarification</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Prix</label>
                    <input
                      type="number" name="price" min="0" step="0.01" value={formData.price}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Devise</label>
                    <select
                      name="currency" value={formData.currency} onChange={handleInputChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    >
                      <option value="XOF">XOF (FCFA)</option>
                      <option value="EUR">EUR (Euro)</option>
                      <option value="USD">USD (Dollar)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">Statut</h2>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleInputChange} className="sr-only" />
                    <div className={`w-10 h-5 rounded-full transition-colors ${formData.is_active ? 'bg-blue-600' : 'bg-gray-700'}`}></div>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${formData.is_active ? 'translate-x-5' : ''}`}></div>
                  </div>
                  <span className="text-sm text-gray-300">{formData.is_active ? 'Template actif' : 'Template inactif'}</span>
                </label>
                <p className="text-xs text-gray-500 mt-2 ml-13">Les templates actifs sont visibles par les utilisateurs.</p>
              </div>

              {/* System info */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">Informations système</h2>
                <dl className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    { label: 'ID', value: template.id },
                    { label: 'Slug', value: template.slug },
                    { label: 'Dossier', value: template.folder_name },
                    { label: 'Version', value: `v${template.version}` },
                    { label: 'Type', value: template.is_system ? 'Système' : 'Personnalisé' },
                    { label: 'Créé le', value: new Date(template.created_at).toLocaleDateString('fr-FR') },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <dt className="text-gray-500 mb-1">{label}</dt>
                      <dd className="font-mono text-gray-300 bg-gray-800 px-2 py-1 rounded truncate">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="flex justify-end gap-3 pb-6">
                <button type="button" onClick={() => router.back()}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:border-gray-600 transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                  {isSubmitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* ── Code Editor Tab ── */
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Editor */}
          <div className={`flex flex-col ${showPreview ? 'w-1/2' : 'w-full'} border-r border-gray-800 transition-all`}>
            {/* File tabs + actions */}
            <div className="flex items-center justify-between bg-gray-900 border-b border-gray-800 px-2 shrink-0">
              <div className="flex">
                {([
                  { key: 'jinja', label: 'template.jinja2', color: 'text-orange-400', icon: '🧩' },
                  { key: 'css', label: 'style.css', color: 'text-blue-400', icon: '🎨' },
                  { key: 'json', label: 'template.json', color: 'text-green-400', icon: '⚙' },
                ] as const).map(({ key, label, color, icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveCodeTab(key)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs border-b-2 transition-all ${activeCodeTab === key
                        ? `border-blue-500 ${color} bg-gray-800`
                        : 'border-transparent text-gray-500 hover:text-gray-300'
                      }`}
                  >
                    <span>{icon}</span>
                    <span className="font-mono">{label}</span>
                    <span className="text-gray-600 text-[10px]">{getLineCount(key)}L</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 pr-2">
                <button
                  onClick={() => setShowPreview(p => !p)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-all ${showPreview ? 'bg-blue-600/20 text-blue-400 border border-blue-700' : 'text-gray-400 hover:text-white border border-gray-700'}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {showPreview ? 'Masquer' : 'Aperçu'}
                </button>
                <button
                  onClick={handleSaveFiles}
                  disabled={isSavingFiles}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-600 hover:bg-green-500 text-white rounded-md transition-colors disabled:opacity-50"
                >
                  {isSavingFiles ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                  )}
                  {isSavingFiles ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </div>

            {/* Editor area with line numbers */}
            <div className="flex-1 flex overflow-hidden bg-gray-950">
              {/* Line numbers */}
              <div className="select-none text-right pr-3 pl-3 pt-4 text-gray-600 text-xs font-mono leading-5 bg-gray-950 border-r border-gray-800 overflow-hidden shrink-0 w-12">
                {currentContent.split('\n').map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              {/* Textarea */}
              <textarea
                className="flex-1 p-4 font-mono text-sm bg-gray-950 text-gray-100 focus:outline-none resize-none leading-5 tab-size-2"
                spellCheck={false}
                value={currentContent}
                onChange={(e) => handleFileContentChange(activeCodeTab, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Tab') {
                    e.preventDefault()
                    const start = e.currentTarget.selectionStart
                    const end = e.currentTarget.selectionEnd
                    const newValue = currentContent.substring(0, start) + '  ' + currentContent.substring(end)
                    handleFileContentChange(activeCodeTab, newValue)
                    setTimeout(() => {
                      e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2
                    }, 0)
                  }
                }}
                style={{ caretColor: '#60a5fa' }}
              />
            </div>

            {/* Status bar */}
            <div className="flex items-center justify-between px-4 py-1 bg-blue-600 text-white text-[10px] font-mono shrink-0">
              <span>
                {activeCodeTab === 'jinja' ? 'Jinja2' : activeCodeTab === 'css' ? 'CSS' : 'JSON'}
                {' · '}
                {getLineCount(activeCodeTab)} lignes
                {' · '}
                {currentContent.length} caractères
              </span>
              <span className="flex items-center gap-2">
                {isRendering && (
                  <span className="flex items-center gap-1 text-blue-200">
                    <div className="w-2 h-2 border border-white border-t-transparent rounded-full animate-spin" />
                    Rendu...
                  </span>
                )}
                UTF-8 · LF
              </span>
            </div>
          </div>

          {/* Right: Live Preview */}
          {showPreview && (
            <div className="w-1/2 flex flex-col bg-gray-100">
              {/* Preview header */}
              <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-gray-400 text-xs ml-2">Aperçu en direct</span>
                  {isRendering && (
                    <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin ml-1" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-xs">Zoom</span>
                  <input
                    type="range" min="30" max="100" value={previewScale * 100}
                    onChange={(e) => setPreviewScale(parseInt(e.target.value) / 100)}
                    className="w-20 h-1 accent-blue-500"
                  />
                  <span className="text-gray-400 text-xs w-8">{Math.round(previewScale * 100)}%</span>
                </div>
              </div>

              {/* Preview iframe */}
              <div className="flex-1 overflow-auto bg-gray-200 p-4">
                {previewHtml ? (
                  <div
                    className="bg-white shadow-2xl mx-auto origin-top transition-transform"
                    style={{
                      width: `${100 / previewScale}%`,
                      transform: `scale(${previewScale})`,
                      transformOrigin: 'top left',
                      minHeight: '297mm',
                    }}
                  >
                    <iframe
                      srcDoc={previewHtml}
                      className="w-full border-0"
                      style={{ height: '297mm', display: 'block' }}
                      title="Template Preview"
                      sandbox="allow-same-origin"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <svg className="w-12 h-12 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm font-medium">Aperçu en attente</p>
                    <p className="text-xs mt-1">Commencez à éditer le template pour voir l&apos;aperçu</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}