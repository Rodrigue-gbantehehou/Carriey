'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import config from '@/lib/config'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [countdown, setCountdown] = useState(5)

  const templateName = searchParams.get('template') || 'votre modèle'
  const paymentId = searchParams.get('payment_id')

  // Countdown auto-redirect
  useEffect(() => {
    if (countdown <= 0) {
      router.push('/dashboard')
      return
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown, router])

  return (
    <div className="min-h-screen bg-background-subtle flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Success animation */}
        <div className="relative mb-8">
          <div className="w-28 h-28 mx-auto bg-success-bg rounded-full flex items-center justify-center animate-pulse">
            <div className="w-20 h-20 bg-success-text rounded-full flex items-center justify-center shadow-lg shadow-success-text/30">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-text-primary mb-3 tracking-tight">
          Paiement Réussi !
        </h1>
        <p className="text-lg text-text-secondary mb-2">
          Vous avez maintenant accès à <strong className="text-text-primary">{templateName}</strong>.
        </p>
        <p className="text-sm text-text-muted mb-8">
          Un email de confirmation a été envoyé à {session?.user?.email || 'votre adresse email'}.
        </p>

        {/* Details */}
        <div className="bg-white border border-border rounded-panel p-6 mb-8 text-left shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-success-bg rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-success-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-bold text-text-primary">Accès activé</span>
          </div>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li className="flex items-center gap-2">
              <span className="text-success-text">✓</span>
              Téléchargement PDF illimité
            </li>
            <li className="flex items-center gap-2">
              <span className="text-success-text">✓</span>
              Export DOCX disponible
            </li>
            <li className="flex items-center gap-2">
              <span className="text-success-text">✓</span>
              Personnalisation complète
            </li>
          </ul>
        </div>

        <Link
          href="/dashboard"
          className="block w-full py-4 bg-white border border-border text-text-primary font-bold rounded-button hover:bg-background-subtle transition-all shadow-sm mb-3 text-center"
        >
          Accéder à mon tableau de bord
        </Link>
        <Link
          href="/editor"
          className="block w-full py-4 bg-primary text-white font-bold rounded-button hover:bg-primary-hover transition-all shadow-sm text-center"
        >
          Créer mon CV maintenant →
        </Link>

        <p className="text-xs text-text-muted mt-6">
          Redirection automatique dans {countdown} seconde{countdown !== 1 ? 's' : ''}...
        </p>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
