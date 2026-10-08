'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { API_BASE } from '@/lib/api'
import {
  Target, CheckCircle2, AlertCircle, Lightbulb, Zap, ChevronRight,
  BarChart2, Tag, ArrowRight, Loader2, FileText, Mail, Bookmark
} from 'lucide-react'
import Link from 'next/link'
import { PaywallModal } from '@/components/app/shared/PaywallModal'
import { toast } from 'react-hot-toast'

interface FitResult {
  score: number
  verdict: string
  strengths: string[]
  gaps: string[]
  angle: { title: string; advice: string }
  keywords_to_use: string[]
  company?: string
  role?: string
  location?: string
}

function ScoreRing({ score }: { score: number }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 70 ? '#10b981' : score >= 45 ? '#f59e0b' : '#ef4444'
  const label = score >= 70 ? 'Bon match' : score >= 45 ? 'Partiel' : 'Faible'

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="10" />
          <circle
            cx="60" cy="60" r={radius} fill="none"
            stroke={color} strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-gray-900">{score}</span>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">/ 100</span>
        </div>
      </div>
      <span className="text-sm font-bold px-3 py-1 rounded-full" style={{ backgroundColor: `${color}20`, color }}>
        {label}
      </span>
    </div>
  )
}

export default function NouvelleCandidaturePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [jobText, setJobText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<FitResult | null>(null)
  const [error, setError] = useState('')
  const [showPaywall, setShowPaywall] = useState(false)

  // Actions post-analyse
  const [tailoringCv, setTailoringCv] = useState(false)
  const [generatingLetter, setGeneratingLetter] = useState(false)

  const handleAnalyze = async () => {
    if (!jobText.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch(`${API_BASE}/ai/analyze-fit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
        body: JSON.stringify({ job_description: jobText }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Erreur lors de l\'analyse.')
      }

      const data = await res.json()
      setResult(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTailorCv = async () => {
    if (!session?.user?.accessToken || !jobText) return
    setTailoringCv(true)
    const toastId = toast.loading('🎯 Adaptation de votre CV en cours...')

    try {
      const { createTailoredCv } = await import('@/lib/cv-adaptation-service')

      const titleSuffix = result?.angle?.title || new Date().toLocaleDateString()
      const newCv = await createTailoredCv(session.user.accessToken, jobText, titleSuffix)

      toast.success('CV ciblé créé avec succès !', { id: toastId })
      router.push(`/mes-documents/cv/${newCv.id}`)
    } catch (err: any) {
      const msg = err?.message || ''
      if (msg.includes('403') || msg.includes('premium')) {
        toast.dismiss(toastId)
        setShowPaywall(true)
      } else {
        toast.error('Erreur lors de l\'adaptation. Réessayez.', { id: toastId })
      }
    } finally {
      setTailoringCv(false)
    }
  }

  const handleGenerateLetter = async () => {
    if (!session?.user?.accessToken || !jobText) return
    setGeneratingLetter(true)
    const toastId = toast.loading('✉️ Génération de votre lettre en cours...')

    try {
      // 1. Générer la lettre via IA
      const genRes = await fetch(`${API_BASE}/ai/generate-letter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify({ job_description: jobText }),
      })

      if (!genRes.ok) throw new Error('Erreur génération lettre')
      const letterData = await genRes.json()

      // 2. Sauvegarder comme document avec la bonne structure
      const { cvApi } = await import('@/lib/cv-api')
      const newLetter = await cvApi.createResume(session.user.accessToken, {
        title: `Lettre – ${result?.angle?.title || new Date().toLocaleDateString()}`,
        template_id: 'classique_lettre',
        doc_type: 'cover_letter',
        content: {
          subject: letterData.subject || '',
          salutation: letterData.salutation || 'Madame, Monsieur,',
          body: letterData.body || letterData.letter_content || '',
          closing: letterData.closing || "Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.",
          recipient: { name: '', company: '', address: '' },
        },
      })

      toast.success('Lettre de motivation créée !', { id: toastId })
      router.push(`/mes-documents/lettre/${newLetter.id}`)
    } catch (err) {
      toast.error('Erreur lors de la génération. Réessayez.', { id: toastId })
    } finally {
      setGeneratingLetter(false)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50/50 font-sans">
        <div className="max-w-4xl mx-auto px-6 py-10">

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 text-xs text-gray-400 font-semibold mb-4">
              <Link href="/accueil" className="hover:text-indigo-600 transition-colors">Accueil</Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/candidatures" className="hover:text-indigo-600 transition-colors">Candidatures</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-700">Nouvelle</span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-indigo-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Nouvelle candidature</h1>
            </div>
            <p className="text-gray-500 font-medium text-sm max-w-xl">
              Démarrez une nouvelle candidature en collant l'offre visée. Carriey analyse votre profil et vous prépare un CV et une lettre sur-mesure.
            </p>
          </div>

          {/* Input */}
          <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-3">Offre d'emploi</label>
            <textarea
              value={jobText}
              onChange={e => setJobText(e.target.value)}
              placeholder="Collez ici le texte complet de l'offre d'emploi (titre, description, compétences requises, etc.)..."
              className="w-full h-48 resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all font-medium"
            />
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-gray-400">{jobText.length} caractères</p>
              <button
                onClick={handleAnalyze}
                disabled={loading || jobText.trim().length < 50}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 transition-all shadow-lg shadow-indigo-600/20"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Analyse en cours...</>
                ) : (
                  <><Target className="w-4 h-4" /> Analyser ma correspondance</>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium mb-6 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-5 animate-fade-in">

              {/* Score + Verdict */}
              <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-8">
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  <ScoreRing score={result.score} />
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-lg font-bold text-gray-900 mb-3">Résultat de l'analyse</h2>
                    <p className="text-gray-600 text-sm leading-relaxed font-medium">{result.verdict}</p>
                  </div>
                </div>
              </div>

              {/* ✨ Actions IA */}
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl shadow-xl shadow-indigo-600/25 p-6">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-indigo-200" />
                  <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Actions recommandées</p>
                </div>
                <h3 className="text-white font-bold text-base mb-5">Passez à l'action sur cette offre</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Adapter le CV */}
                  <button
                    onClick={handleTailorCv}
                    disabled={tailoringCv || generatingLetter}
                    className="flex flex-col items-start gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-4 text-left transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed group"
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      {tailoringCv ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <FileText className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Adapter mon CV</p>
                      <p className="text-xs text-indigo-200 mt-0.5">Génère un CV ciblé par IA</p>
                    </div>
                  </button>

                  {/* Générer la lettre */}
                  <button
                    onClick={handleGenerateLetter}
                    disabled={tailoringCv || generatingLetter}
                    className="flex flex-col items-start gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-4 text-left transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed group"
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      {generatingLetter ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Mail className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Rédiger ma lettre</p>
                      <p className="text-xs text-indigo-200 mt-0.5">Lettre adaptée à l'offre</p>
                    </div>
                  </button>

                  {/* Sauvegarder en candidature */}
                  <Link
                    href={`/candidatures?new=1&score=${result.score}&company=${encodeURIComponent(result.company || '')}&role=${encodeURIComponent(result.role || '')}&location=${encodeURIComponent(result.location || '')}`}
                    onClick={() => sessionStorage.setItem('tempJobDescription', jobText)}
                    className="flex flex-col items-start gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-4 text-left transition-all hover:-translate-y-0.5 group"
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Bookmark className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Suivre la candidature</p>
                      <p className="text-xs text-indigo-200 mt-0.5">Score {result.score}% pré-rempli</p>
                    </div>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Strengths */}
                <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">Points forts</h3>
                  </div>
                  <ul className="space-y-3">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Gaps */}
                <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">À améliorer</h3>
                  </div>
                  <ul className="space-y-3">
                    {result.gaps.map((g, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600 font-medium">
                        <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Angle recommandé */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-indigo-600" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">Angle de profil recommandé</h3>
                </div>
                <p className="text-base font-bold text-indigo-700 mb-2">{result.angle.title}</p>
                <p className="text-sm text-indigo-600/80 leading-relaxed font-medium">{result.angle.advice}</p>
              </div>

              {/* Mots-clés */}
              <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Tag className="w-4 h-4 text-gray-600" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">Mots-clés à inclure dans vos documents</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.keywords_to_use.map((kw, i) => (
                    <span key={i} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-100">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        title="Fonctionnalité PRO"
        description="L'adaptation de CV par IA est réservée aux abonnés Carriey PRO. Passez au plan PRO pour générer un CV parfaitement ciblé sur chaque offre en 1 clic."
      />
    </>
  )
}
