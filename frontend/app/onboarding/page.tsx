'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useEditorStore } from '@/store/editor'

const QUALIFICATIONS = [
    { id: 'none', label: 'Sans expérience' },
    { id: 'junior', label: 'Moins de 3 ans' },
    { id: 'mid', label: '3-5 ans' },
    { id: 'senior', label: '5-10 ans' },
    { id: 'expert', label: 'Plus de 10 ans' },
]

export default function OnboardingPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { setOnboardingData } = useEditorStore()

    const step = searchParams.get('step') || 'experience'
    const template = searchParams.get('template')

    const handleSelectExperience = (id: string) => {
        setOnboardingData({ experience: id })
        router.push('/modeles')
    }

    const handleSelectMethod = (method: 'new' | 'import') => {
        setOnboardingData({ method })
        const templateParam = template ? `?template=${template}` : ''
        router.push(`/editor${templateParam}`)
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <Link href="/" className="absolute top-8 left-8 text-2xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                CVtor
            </Link>

            <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl p-8 sm:p-12">
                {step === 'experience' && (
                    <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold text-slate-900">Depuis combien de temps travaillez-vous ?</h1>
                            <p className="text-slate-500">Nous vous recommanderons les modèles correspondant le mieux à votre expérience.</p>
                        </div>

                        <div className="grid gap-3">
                            {QUALIFICATIONS.map((q) => (
                                <button
                                    key={q.id}
                                    onClick={() => handleSelectExperience(q.id)}
                                    className="w-full py-4 px-6 rounded-2xl border-2 border-slate-100 hover:border-orange-600 hover:bg-orange-50 text-left font-semibold text-slate-700 transition-all active:scale-[0.98]"
                                >
                                    {q.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 'method' && (
                    <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold text-slate-900">De quelle manière voulez-vous créer votre CV ?</h1>
                            <p className="text-slate-500">Choisissez l'option qui vous fait gagner le plus de temps.</p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <button
                                onClick={() => handleSelectMethod('new')}
                                className="group p-6 rounded-3xl border-2 border-slate-100 hover:border-orange-600 hover:bg-orange-50 text-center space-y-4 transition-all active:scale-[0.98]"
                            >
                                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-3xl mx-auto group-hover:scale-110 transition-transform">
                                    ✨
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Créer un nouveau CV</h3>
                                    <p className="text-xs text-slate-500 mt-1">Recommandé : Utilisez notre outil facile à utiliser.</p>
                                </div>
                            </button>

                            <button
                                onClick={() => handleSelectMethod('import')}
                                className="group p-6 rounded-3xl border-2 border-slate-100 hover:border-orange-600 hover:bg-orange-50 text-center space-y-4 transition-all active:scale-[0.98]"
                            >
                                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-3xl mx-auto group-hover:scale-110 transition-transform">
                                    📥
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Importer un CV</h3>
                                    <p className="text-xs text-slate-500 mt-1">Transférez le contenu de votre CV actuel dans un nouveau design.</p>
                                </div>
                            </button>
                        </div>

                        <Link href="/modeles" className="inline-block text-sm text-slate-400 hover:text-orange-600 transition-colors">
                            ← Retourner aux modèles de CV
                        </Link>
                    </div>
                )}
            </div>

            <div className="mt-8 text-slate-400 text-xs">
                Étape {step === 'experience' ? '1' : '3'} sur 4
            </div>
        </div>
    )
}
