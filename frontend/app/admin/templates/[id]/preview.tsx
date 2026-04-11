'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

interface TemplatePreviewProps {
    template: any
}

export default function TemplatePreview({ template }: TemplatePreviewProps) {
    const { data: session } = useSession()
    const [isLoading, setIsLoading] = useState(false)
    const [previewHtml, setPreviewHtml] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const generatePreview = async () => {
        if (!session?.user?.accessToken) {
            setError('Token d\'authentification non trouvé')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            // Données de test pour la prévisualisation
            const testData = {
                profile: {
                    name: "Jean Dupont",
                    title: "Développeur Full Stack",
                    email: "jean.dupont@email.com",
                    phone: "+33 6 12 34 56 78",
                    location: "Paris, France",
                    linkedin: "linkedin.com/in/jeandupont",
                    github: "github.com/jeandupont",
                    summary: "Développeur full stack avec 5 ans d'expérience dans la création d'applications web modernes et scalables. Passionné par les nouvelles technologies et l'optimisation des performances."
                },
                experience: [
                    {
                        position: "Développeur Senior",
                        company: "Tech Company",
                        start_date: "2022-01",
                        end_date: "2024-01",
                        description: "Développement d'applications web avec React et Node.js. Optimisation des performances et mise en place des bonnes pratiques."
                    },
                    {
                        position: "Développeur Full Stack",
                        company: "Startup Innovation",
                        start_date: "2020-01",
                        end_date: "2022-01",
                        description: "Participation au développement complet de l'application de A à Z. Gestion de la base de données et des API REST."
                    }
                ],
                education: [
                    {
                        degree: "Master en Informatique",
                        institution: "Université Paris-Saclay",
                        start_date: "2018-01",
                        end_date: "2020-01",
                        description: "Spécialisation en intelligence artificielle et systèmes distribués."
                    }
                ],
                skills: [
                    { name: "JavaScript", level: "Expert" },
                    { name: "React", level: "Expert" },
                    { name: "Node.js", level: "Avancé" },
                    { name: "Python", level: "Avancé" },
                    { name: "Docker", level: "Intermédiaire" },
                    { name: "AWS", level: "Intermédiaire" }
                ],
                languages: [
                    { name: "Français", level: "Langue maternelle" },
                    { name: "Anglais", level: "Professionnel" },
                    { name: "Espagnol", level: "Intermédiaire" }
                ],
                projects: [
                    {
                        name: "E-commerce Platform",
                        description: "Plateforme de vente en ligne avec panier, paiement et gestion des stocks.",
                        technologies: ["React", "Node.js", "MongoDB", "Stripe"]
                    }
                ]
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/preview`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.user.accessToken}`
                },
                body: JSON.stringify({
                    template_name: template.slug,
                    data: testData
                })
            })

            if (!response.ok) {
                throw new Error('Erreur lors de la génération de la prévisualisation')
            }

            const html = await response.text()
            setPreviewHtml(html)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                    Cliquez sur le bouton pour générer une prévisualisation du template avec des données d&apos;exemple.
                </p>
                <button
                    onClick={generatePreview}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Génération...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Générer la prévisualisation
                        </>
                    )}
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div className="ml-3">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {previewHtml && (
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Prévisualisation du template</span>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => {
                                        const printWindow = window.open('', '_blank')
                                        if (printWindow) {
                                            printWindow.document.write(`
                                                <!DOCTYPE html>
                                                <html>
                                                <head>
                                                    <title>Preview - ${template.name}</title>
                                                    <style>
                                                        @media print {
                                                            body { margin: 0; }
                                                        }
                                                    </style>
                                                </head>
                                                <body>
                                                    ${previewHtml}
                                                </body>
                                                </html>
                                            `)
                                            printWindow.document.close()
                                            printWindow.print()
                                        }
                                    }}
                                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    Imprimer
                                </button>
                                <button
                                    onClick={() => {
                                        const blob = new Blob([previewHtml], { type: 'text/html' })
                                        const url = URL.createObjectURL(blob)
                                        const a = document.createElement('a')
                                        a.href = url
                                        a.download = `preview-${template.slug}.html`
                                        document.body.appendChild(a)
                                        a.click()
                                        document.body.removeChild(a)
                                        URL.revokeObjectURL(url)
                                    }}
                                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Télécharger
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white" style={{ minHeight: '600px' }}>
                        <iframe
                            srcDoc={previewHtml}
                            className="w-full"
                            style={{ height: '800px', border: 'none' }}
                            title="Template Preview"
                        />
                    </div>
                </div>
            )}

            {!previewHtml && !isLoading && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune prévisualisation</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Cliquez sur &quot;Générer la prévisualisation&quot; pour voir le template avec des données d&apos;exemple.
                    </p>
                </div>
            )}
        </div>
    )
}
