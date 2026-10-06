'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import config from '@/lib/config'

function SetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }
    
    if (password.length < 6) {
      setError("Le mot de passe doit faire au moins 6 caractères.")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${config.apiBaseUrl}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password }),
      })

      if (response.ok) {
        toast.success("Mot de passe enregistré avec succès !")
        router.push('/login')
      } else {
        const errData = await response.json()
        setError(errData.detail || "Le lien est invalide ou a expiré.")
      }
    } catch (err) {
      setError("Impossible de contacter le serveur.")
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen bg-white">
        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24 text-center">
          <div className="mx-auto w-full max-w-sm">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Lien Invalide</h1>
            <p className="text-gray-500 mb-8">Ce lien de configuration du mot de passe est manquant ou invalide.</p>
            <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors">
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left panel */}
      <div className="relative hidden w-0 flex-1 lg:block bg-gray-50 border-r border-gray-100 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-gray-200 p-12 max-w-lg shadow-xl shadow-gray-200/50">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Sécurisez votre compte</h3>
            <p className="text-gray-500">Définissez un mot de passe robuste pour protéger vos données et vos CV.</p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image src={config.appLogo} alt={config.appName} width={32} height={32} className="object-contain" priority />
              <span className="text-2xl font-bold text-gray-900">{config.appName}</span>
            </Link>
            <h2 className="mt-8 text-2xl font-bold tracking-tight text-gray-900">Nouveau mot de passe</h2>
            <p className="mt-2 text-sm text-gray-500">Veuillez définir votre nouveau mot de passe.</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                Mot de passe
              </label>
              <div className="mt-2 relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border border-gray-200 bg-white py-2.5 pl-3 pr-10 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none sm:text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900">
                Confirmez le mot de passe
              </label>
              <div className="mt-2 relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-md border border-gray-200 bg-white py-2.5 pl-3 pr-10 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none sm:text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Enregistrer <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-pulse text-gray-400">Chargement...</div></div>}>
      <SetPasswordContent />
    </Suspense>
  )
}
