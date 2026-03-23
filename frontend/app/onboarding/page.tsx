'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useEditorStore } from '@/store/editor'
import Navbar from '@/components/layout/Navbar'

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
        <div className="min-h-screen bg-brand-bg flex flex-col selection:bg-brand-cta selection:text-white relative overflow-hidden">
            <Navbar />
            
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                {/* Background Accents */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
                    <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-brand-cta/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-emerald-500/5 rounded-full blur-[100px]" />
                </div>

            <div className="max-w-2xl w-full bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-gray-100 p-8 sm:p-16 relative">
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-50 rounded-t-[40px] overflow-hidden">
                    <div 
                        className="h-full bg-brand-cta transition-all duration-700 ease-out" 
                        style={{ width: step === 'experience' ? '25%' : '75%' }}
                    />
                </div>

                {step === 'experience' && (
                    <div className="text-center space-y-12 animate-slide-up">
                        <div className="space-y-4">
                            <div className="inline-block px-4 py-1.5 bg-brand-cta/10 text-brand-cta text-[10px] font-black uppercase tracking-widest rounded-full">
                                Étape 01
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-black text-brand-text tracking-tight leading-tight">
                                Quel est votre <br />
                                <span className="text-brand-cta">niveau d'expérience ?</span>
                            </h1>
                            <p className="text-brand-muted font-medium max-w-sm mx-auto">
                                Nous personnaliserons les modèles pour qu'ils correspondent parfaitement à votre parcours.
                            </p>
                        </div>

                        <div className="grid gap-3">
                            {QUALIFICATIONS.map((q, idx) => (
                                <button
                                    key={q.id}
                                    onClick={() => handleSelectExperience(q.id)}
                                    className="w-full py-5 px-8 rounded-2xl border border-gray-100 bg-brand-bg hover:border-brand-cta/50 hover:bg-white hover:shadow-xl hover:shadow-brand-cta/5 text-left font-bold text-brand-text transition-all active:scale-[0.98] group flex items-center justify-between"
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    <span>{q.label}</span>
                                    <svg className="w-5 h-5 text-gray-300 group-hover:text-brand-cta group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 'method' && (
                    <div className="text-center space-y-12 animate-slide-up">
                        <div className="space-y-4">
                            <div className="inline-block px-4 py-1.5 bg-brand-cta/10 text-brand-cta text-[10px] font-black uppercase tracking-widest rounded-full">
                                Étape 03
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-black text-brand-text tracking-tight leading-tight">
                                Comment souhaitez-vous <br />
                                <span className="text-brand-cta">démarrer ?</span>
                            </h1>
                            <p className="text-brand-muted font-medium max-w-sm mx-auto">
                                Choisissez la méthode qui vous convient le mieux pour gagner du temps.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            <button
                                onClick={() => handleSelectMethod('new')}
                                className="group p-8 rounded-[32px] border border-gray-100 bg-brand-bg hover:border-brand-cta/50 hover:bg-white hover:shadow-2xl hover:shadow-brand-cta/10 text-center space-y-6 transition-all active:scale-[0.98]"
                            >
                                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-4xl mx-auto shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                    ✨
                                </div>
                                <div>
                                    <h3 className="font-bold text-brand-text text-lg">Partir de zéro</h3>
                                    <p className="text-xs text-brand-muted mt-2 font-medium leading-relaxed">
                                        Laissez-vous guider étape par étape par notre assistant intelligent.
                                    </p>
                                </div>
                            </button>

                            <button
                                onClick={() => handleSelectMethod('import')}
                                className="group p-8 rounded-[32px] border border-gray-100 bg-brand-bg hover:border-brand-cta/50 hover:bg-white hover:shadow-2xl hover:shadow-brand-cta/10 text-center space-y-6 transition-all active:scale-[0.98]"
                            >
                                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-4xl mx-auto shadow-lg group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                                    📥
                                </div>
                                <div>
                                    <h3 className="font-bold text-brand-text text-lg">Importer un CV</h3>
                                    <p className="text-xs text-brand-muted mt-2 font-medium leading-relaxed">
                                        Transférez le contenu de votre ancien fichier vers ce nouveau design.
                                    </p>
                                </div>
                            </button>
                        </div>

                        <Link href="/modeles" className="inline-flex items-center gap-2 text-sm font-bold text-brand-muted hover:text-brand-cta transition-colors group">
                            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                            </svg>
                            Retourner aux modèles
                        </Link>
                    </div>
                )}
            </div>

            <div className="mt-12 flex items-center gap-6">
                <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden shadow-sm">
                            <img src={`https://i.pravatar.cc/100?img=${i + 20}`} alt="user" className="w-full h-full object-cover grayscale opacity-80" />
                        </div>
                    ))}
                </div>
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
                    Rejoignez <span className="text-brand-text">+15 000</span> professionnels
                </p>
            </div>
            </div>
        </div>
    )
}
