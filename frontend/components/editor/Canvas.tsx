"use client"
import React, { useEffect, useMemo, useState } from 'react'
import { previewHtml } from '../../lib/api'
import { API_BASE } from '../../lib/api'

// Utility: rewrite asset href/src from relative to backend static
function rewriteAssets(html: string, backendBase = `${API_BASE}/static/`) {
  // replace href="styles.css" -> href="http://localhost:8000/static/styles.css"
  return html
    .replace(/href=\"(styles[^\"]*)\"/g, `href="${backendBase}$1"`)
    .replace(/href=\"(styles_[^\"]*)\"/g, `href="${backendBase}$1"`)
    .replace(/src=\"(photo[^\"]*)\"/g, `src="${backendBase}$1"`)
}

export default function Canvas({ template, data }: { template: any, data: any }) {
  const [html, setHtml] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const doc = useMemo(() => ({ template, data }), [template, data])

  useEffect(() => {
    let mounted = true
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const res = await previewHtml(doc.template, doc.data)
        const patched = rewriteAssets(res.html)
        if (mounted) setHtml(patched)
      } catch (e: any) {
        setError(e?.message || 'Erreur preview')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    run()
    return () => { mounted = false }
  }, [doc])

  return (
    <div className="w-full h-[calc(100vh-160px)] bg-slate-900 border border-slate-800 rounded overflow-hidden">
      {loading && <div className="p-3 text-sm text-slate-400">Prévisualisation…</div>}
      {error && <div className="p-3 text-sm text-red-400">{error}</div>}
      {!loading && !error && html && (
        <iframe className="w-full h-full bg-white" srcDoc={html} />
      )}
    </div>
  )
}
