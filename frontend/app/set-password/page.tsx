'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import config from '@/lib/config'

function SetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      return toast.error("Les mots de passe ne correspondent pas")
    }
    
    if (password.length < 6) {
      return toast.error("Le mot de passe doit faire au moins 6 caractères")
    }

    setLoading(true)
    try {
      const response = await fetch(`${config.apiBaseUrl}/auth/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      if (response.ok) {
        toast.success("Votre mot de passe a été défini avec succès !")
        router.push('/login')
      } else {
        const error = await response.json()
        toast.error(error.detail || "Le lien est invalide ou a expiré")
      }
    } catch (error) {
      toast.error("Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Lien Invalide</h1>
          <p className="text-gray-600 mb-6">Ce lien de configuration du mot de passe est manquant ou invalide.</p>
          <button onClick={() => router.push('/')} className="bg-brand-cta text-white px-6 py-2 rounded-xl font-bold">Retour à l'accueil</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden border border-gray-100 p-8 sm:p-12">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-brand-cta/10 text-brand-cta rounded-2xl flex items-center justify-center mx-auto mb-6">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h1 className="text-3xl font-black text-brand-text tracking-tight uppercase leading-none mb-2">Finalisez votre compte</h1>
          <p className="text-brand-muted font-medium text-sm">Définissez votre mot de passe pour accéder à vos CV à tout moment.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Nouveau mot de passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-brand-cta focus:bg-white transition-all font-medium text-brand-text"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Confirmez le mot de passe</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-brand-cta focus:bg-white transition-all font-medium text-brand-text"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-brand-text text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl shadow-black/10 uppercase tracking-wider text-sm disabled:opacity-50"
          >
            {loading ? "Traitement..." : "Enregistrer et Se Connecter"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <SetPasswordContent />
    </Suspense>
  )
}
