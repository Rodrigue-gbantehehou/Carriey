'use client'

import { useEffect, useState, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import config from '@/lib/config'

export default function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const { data: session } = useSession()
    const router = useRouter()
    const [template, setTemplate] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)

    const fetchTemplate = useCallback(async () => {
        try {
            const res = await fetch(`${config.apiBaseUrl}/templates`)
            if (res.ok) {
                const templates = await res.json()
                const found = templates.find((t: any) => t.id === resolvedParams.id)
                if (found) setTemplate(found)
            }
        } catch (e) {
            console.error(e)
        }
    }, [resolvedParams.id])

    useEffect(() => {
        if (!session) {
            router.push('/login')
            return
        }
        fetchTemplate()
    }, [session, router, fetchTemplate])

    const handlePayment = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`${config.apiBaseUrl}/payments/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.user.accessToken}`
                },
                body: JSON.stringify({
                    template_id: resolvedParams.id,
                    amount: parseFloat(template.price), // ou int selon API
                    currency: template.currency
                })
            })

            if (res.ok) {
                const data = await res.json()
                // Redirection vers KkiaPay
                if (data.payment_url) {
                    window.location.href = data.payment_url
                } else {
                    alert("Erreur: Pas d'URL de paiement reçue")
                }
            } else {
                const err = await res.json()
                alert(`Erreur paiement: ${err.detail || 'Inconnue'}`)
            }
        } catch (e) {
            console.error(e)
            alert("Erreur de connexion au serveur")
        } finally {
            setIsLoading(false)
        }
    }

    if (!template) return <div className="p-10 text-center">Chargement...</div>

    return (
        <div className="min-h-screen bg-background-subtle flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-panel shadow-xl overflow-hidden">
                <div className="bg-primary p-6 text-center">
                    <h1 className="text-white text-2xl font-bold">Paiement Sécurisé</h1>
                </div>

                <div className="p-8">
                    <div className="mb-6 text-center">
                        <p className="text-text-secondary mb-2">Vous allez acheter le modèle</p>
                        <h2 className="text-3xl font-bold text-text-primary">{template.name}</h2>
                    </div>

                    <div className="bg-background-subtle p-4 rounded-panel mb-8 flex justify-between items-center bg-primary-subtle border border-indigo-100">
                        <span className="font-medium text-indigo-900">Montant à payer</span>
                        <span className="text-2xl font-bold text-primary">{template.price} {template.currency}</span>
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={isLoading}
                        className="w-full py-4 bg-primary hover:bg-primary-hover text-white text-lg font-bold rounded-button transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? 'Initialisation...' : `Payer avec KkiaPay`}
                    </button>

                    <button
                        onClick={() => router.back()}
                        className="w-full mt-4 py-2 text-text-secondary hover:text-text-secondary"
                    >
                        Annuler
                    </button>
                </div>

                <div className="bg-background-subtle p-4 text-center text-xs text-text-muted">
                    Paiement sécurisé par KkiaPay. Aucun frais caché.
                </div>
            </div>
        </div>
    )
}
