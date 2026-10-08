'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import config from '@/lib/config'
import { toast } from 'react-hot-toast'
import { Settings, Save, BrainCircuit } from 'lucide-react'

interface SystemConfig {
    key: string
    value: string
    description?: string
}

export default function AdminConfigsPage() {
    const { data: session } = useSession()
    const [configs, setConfigs] = useState<SystemConfig[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Form states
    const [aiProvider, setAiProvider] = useState('gemini')
    const [aiModelGemini, setAiModelGemini] = useState('gemini-2.0-flash')
    const [aiModelGroq, setAiModelGroq] = useState('llama-3.3-70b-versatile')

    useEffect(() => {
        const fetchConfigs = async () => {
            try {
                const res = await fetch(`${config.apiBaseUrl}/admin/configs`, {
                    headers: { 'Authorization': `Bearer ${session?.user?.accessToken}` }
                })
                if (res.ok) {
                    const data: SystemConfig[] = await res.json()
                    setConfigs(data)
                    
                    // Parse values
                    const provider = data.find(c => c.key === 'ai_provider')?.value
                    if (provider) setAiProvider(provider)
                        
                    const geminiModel = data.find(c => c.key === 'ai_model_gemini')?.value
                    if (geminiModel) setAiModelGemini(geminiModel)
                        
                    const groqModel = data.find(c => c.key === 'ai_model_groq')?.value
                    if (groqModel) setAiModelGroq(groqModel)
                }
            } catch (err: any) {
                toast.error(err.message)
            } finally {
                setLoading(false)
            }
        }
        if (session?.user?.accessToken) fetchConfigs()
    }, [session])

    const saveConfig = async (key: string, value: string) => {
        const res = await fetch(`${config.apiBaseUrl}/admin/configs/${key}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.user?.accessToken}` 
            },
            body: JSON.stringify({ value })
        })
        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.detail || `Erreur sauvegarde ${key}`)
        }
    }

    const handleSaveAIConfigs = async () => {
        setSaving(true)
        try {
            await Promise.all([
                saveConfig('ai_provider', aiProvider),
                saveConfig('ai_model_gemini', aiModelGemini),
                saveConfig('ai_model_groq', aiModelGroq)
            ])
            toast.success("Configurations IA mises à jour !")
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-xl font-semibold text-gray-900 mb-1">Configurations Système</h1>
                <p className="text-sm text-gray-500">Gérez les paramètres globaux de l'application.</p>
            </div>

            {/* AI Configuration Section */}
            <div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                    <div className="w-10 h-10 bg-purple-50 rounded-md flex items-center justify-center text-purple-600 border border-purple-100">
                        <BrainCircuit className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Intelligence Artificielle</h2>
                        <p className="text-xs text-gray-500">Fournisseurs et modèles utilisés pour les générations.</p>
                    </div>
                </div>

                <div className="space-y-5">
                    {/* Provider Select */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur Actif</label>
                        <select
                            value={aiProvider}
                            onChange={(e) => setAiProvider(e.target.value)}
                            className="w-full md:w-1/2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-200"
                        >
                            <option value="gemini">Google Gemini (Défaut)</option>
                            <option value="groq">Groq (Open-Source)</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Le fournisseur sélectionné gérera toutes les requêtes IA de la plateforme.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        {/* Gemini Model */}
                        <div className={`p-4 rounded-md border ${aiProvider === 'gemini' ? 'border-purple-200 bg-purple-50/30' : 'border-gray-100 bg-gray-50'}`}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Modèle Gemini</label>
                            <input
                                type="text"
                                value={aiModelGemini}
                                onChange={(e) => setAiModelGemini(e.target.value)}
                                placeholder="ex: gemini-2.0-flash"
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                            />
                            <p className="text-xs text-gray-500 mt-1">Nom exact du modèle (ex: gemini-2.0-flash, gemini-1.5-pro).</p>
                        </div>

                        {/* Groq Model */}
                        <div className={`p-4 rounded-md border ${aiProvider === 'groq' ? 'border-purple-200 bg-purple-50/30' : 'border-gray-100 bg-gray-50'}`}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Modèle Groq</label>
                            <input
                                type="text"
                                value={aiModelGroq}
                                onChange={(e) => setAiModelGroq(e.target.value)}
                                placeholder="ex: llama-3.3-70b-versatile"
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                            />
                            <p className="text-xs text-gray-500 mt-1">Nom exact du modèle (ex: llama-3.3-70b-versatile, mixtral-8x7b-32768).</p>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            onClick={handleSaveAIConfigs}
                            disabled={saving}
                            className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            ) : (
                                <><Save className="w-4 h-4" /> Enregistrer</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
