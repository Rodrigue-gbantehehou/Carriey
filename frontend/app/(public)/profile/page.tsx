'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Navbar from '@/components/public/Navbar'
import config from '@/lib/config'
import Link from 'next/link'

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [loadingPassword, setLoadingPassword] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
    if (session?.user?.name) {
      setFullName(session.user.name)
    }
  }, [session, status, router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.accessToken) return

    setLoadingProfile(true)
    try {
      const res = await fetch(`${config.apiBaseUrl}/auth/profile?full_name=${encodeURIComponent(fullName)}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`,
        },
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Erreur lors de la mise à jour')
      }

      await update({ name: fullName })
      toast.success('Profil mis à jour avec succès')
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la mise à jour')
    } finally {
      setLoadingProfile(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.accessToken) return

    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Le mot de passe doit faire au moins 6 caractères')
      return
    }

    setLoadingPassword(true)
    try {
      const res = await fetch(`${config.apiBaseUrl}/auth/change-password`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Erreur lors du changement')
      }

      toast.success('Mot de passe modifié avec succès')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors du changement')
    } finally {
      setLoadingPassword(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-cta" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-bg">

      <div className="max-w-2xl mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-brand-cta/10 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-brand-cta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-black text-brand-text">Mon Profil</h1>
              <p className="text-brand-muted text-sm">{session?.user?.email}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white border border-gray-100 rounded-2xl p-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-brand-text text-white shadow-sm'
                : 'text-brand-muted hover:text-brand-text'
            }`}
          >
            Informations
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'security'
                ? 'bg-brand-text text-white shadow-sm'
                : 'text-brand-muted hover:text-brand-text'
            }`}
          >
            Sécurité
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-brand-text mb-6">Informations personnelles</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={session?.user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-400 cursor-not-allowed text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">L&apos;email ne peut pas être modifié</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Prénom Nom"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-brand-cta focus:bg-white transition-all text-sm font-medium text-brand-text"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loadingProfile}
                  className="px-6 py-3 bg-brand-text text-white font-bold rounded-xl hover:bg-black transition-all text-sm disabled:opacity-50"
                >
                  {loadingProfile ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <Link
                  href="/dashboard"
                  className="px-6 py-3 border border-gray-200 text-brand-muted font-bold rounded-xl hover:bg-gray-50 transition-all text-sm"
                >
                  Retour
                </Link>
              </div>
            </form>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-brand-text mb-6">Changer le mot de passe</h2>
            <form onSubmit={handleChangePassword} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-brand-cta focus:bg-white transition-all text-sm font-medium text-brand-text"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-brand-cta focus:bg-white transition-all text-sm font-medium text-brand-text"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:bg-white transition-all text-sm font-medium text-brand-text ${
                    confirmPassword && confirmPassword !== newPassword
                      ? 'border-red-300 focus:border-red-400'
                      : 'border-gray-100 focus:border-brand-cta'
                  }`}
                />
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas</p>
                )}
              </div>
              <button
                type="submit"
                disabled={loadingPassword || (!!confirmPassword && confirmPassword !== newPassword)}
                className="px-6 py-3 bg-brand-text text-white font-bold rounded-xl hover:bg-black transition-all text-sm disabled:opacity-50"
              >
                {loadingPassword ? 'Modification...' : 'Modifier le mot de passe'}
              </button>
            </form>

            {/* Danger Zone */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-bold text-red-500 mb-3">Zone de déconnexion</h3>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="px-6 py-3 border border-red-200 text-red-500 font-bold rounded-xl hover:bg-red-50 transition-all text-sm"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
