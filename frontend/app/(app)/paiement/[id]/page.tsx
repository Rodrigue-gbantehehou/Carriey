'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import config from '@/lib/config'

export default function PaymentPage({ params }: { params: { id: string } }) {
    const { data: session } = useSession()
    const router = useRouter()
    const [template, setTemplate] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)

    const fetchTemplate = useCallback(async () => {
        try {
            const res = await fetch(`${config.apiBaseUrl}/templates`)
            if (res.ok) {
                const templates = await res.json()
                const found = templates.find((t: any) => t.id === params.id)
                if (found) setTemplate(found)
            }
        } catch (e) {
            console.error(e)
        }
    }, [params.id])

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
                    template_id: params.id,
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
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-indigo-600 p-6 text-center">
                    <h1 className="text-white text-2xl font-bold">Paiement Sécurisé</h1>
                </div>

                <div className="p-8">
                    <div className="mb-6 text-center">
                        <p className="text-gray-500 mb-2">Vous allez acheter le modèle</p>
                        <h2 className="text-3xl font-bold text-gray-800">{template.name}</h2>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl mb-8 flex justify-between items-center bg-indigo-50 border border-indigo-100">
                        <span className="font-medium text-indigo-900">Montant à payer</span>
                        <span className="text-2xl font-bold text-indigo-600">{template.price} {template.currency}</span>
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={isLoading}
                        className="w-full py-4 bg-green-500 hover:bg-green-600 text-white text-lg font-bold rounded-xl transition-colors shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'Initialisation...' : `Payer avec KkiaPay`}
                    </button>

                    <button
                        onClick={() => router.back()}
                        className="w-full mt-4 py-2 text-gray-500 hover:text-gray-700"
                    >
                        Annuler
                    </button>
                </div>

                <div className="bg-gray-50 p-4 text-center text-xs text-gray-400">
                    Paiement sécurisé par KkiaPay. Aucun frais caché.
                </div>
            </div>
        </div>
    )
}
