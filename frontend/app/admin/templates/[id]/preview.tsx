'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { CVTemplateRenderer } from '@/components/app/cv/templates'
import { LetterTemplateRenderer } from '@/components/app/letter/LetterTemplateRenderer'
import { PublicPageTemplateRenderer } from '@/components/app/public-page/templates'
import config from '@/lib/config'

interface TemplatePreviewProps {
    template: any
}

export default function TemplatePreview({ template }: TemplatePreviewProps) {
    const { data: session } = useSession()
    const [isLoading, setIsLoading] = useState(false)
    const [previewHtml, setPreviewHtml] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const [showPreview, setShowPreview] = useState(false)

    const generatePreview = () => {
        setIsLoading(true)
        // Simuler un léger chargement pour l'UX
        setTimeout(() => {
            setShowPreview(true)
            setIsLoading(false)
        }, 500)
    }

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
        skills: {
            groups: [
                { label: "Frontend", items: ["JavaScript", "React"] },
                { label: "Backend", items: ["Node.js", "Python"] },
                { label: "DevOps", items: ["Docker", "AWS"] }
            ]
        },
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

    const templateConfig = {
        templateName: template.slug,
        ...template.definition
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
            {showPreview && (
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Prévisualisation du template React</span>
                        </div>
                    </div>
                    <div className="bg-gray-50 overflow-y-auto flex justify-center py-8" style={{ height: '800px' }}>
                        <div className="bg-white shadow-lg relative transform origin-top" style={{ width: '210mm', minHeight: '297mm' }}>
                            {template.template_type === 'cover_letter' ? (
                                <LetterTemplateRenderer 
                                    templateName={template.slug} 
                                    data={{
                                        profile: testData.profile as any,
                                        formData: {
                                            title: "Candidature",
                                            recipientName: "Recruteur",
                                            companyName: "Entreprise Tech",
                                            recipientAddress: "Paris, France",
                                            subject: "Candidature au poste de Développeur",
                                            salutation: "Madame, Monsieur,",
                                            body: "Par la présente, je vous adresse ma candidature...\n\nJe suis très motivé.",
                                            closing: "Veuillez agréer mes salutations distinguées."
                                        }
                                    }} 
                                />
                            ) : template.template_type === 'public_page' ? (
                                <PublicPageTemplateRenderer
                                    templateName={template.folder_name || template.slug}
                                    accent="#6366f1"
                                    data={{
                                        page: { show_photo: true, show_contact: true, theme: (template.folder_name || template.slug) as any, accent_color: '#6366f1', title: 'Profil exemple', slug: 'exemple', custom_bio: null, seo_description: null, id: 'preview', views: 0, sections: { bio: true, experiences: true, education: true, skills: true, projects: true, certifications: true, languages: true, links: true } },
                                        profile: { first_name: 'Jean', last_name: 'Dupont', username: 'jeandupont', title: 'Développeur Full Stack', location: 'Paris, France', bio: 'Développeur passionné avec 5 ans d\'expérience en création d\'applications web modernes.', contact_email: 'jean@example.com', contact_phone: '+33 6 12 34 56 78', photo_url: null, linkedin_url: 'https://linkedin.com', github_url: 'https://github.com', website: null, experiences: [{ id: '1', title: 'Développeur Senior', company: 'Tech Corp', start_date: '2022-01', end_date: null, current: true, location: 'Paris', description: 'Développement d\'applications React et Node.js.' }], educations: [{ id: '1', degree: 'Master Informatique', school: 'Université Paris', start_date: '2018-09', end_date: '2020-06' }], skills: [{ id: '1', name: 'React' }, { id: '2', name: 'TypeScript' }, { id: '3', name: 'Python' }], projects: [], certifications: [], languages: [{ id: '1', name: 'Français', level: 'Natif' }, { id: '2', name: 'Anglais', level: 'Courant' }], references: [], custom_sections: [] } as any
                                    }}
                                />
                            ) : (
                                <CVTemplateRenderer 
                                    templateName={template.slug} 
                                    data={testData} 
                                    config={templateConfig} 
                                    apiBaseUrl={config.apiBaseUrl} 
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {!showPreview && !isLoading && (
                template.preview_image ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 flex justify-center bg-gray-50 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={template.preview_image.startsWith('http') ? template.preview_image : `${config.staticBaseUrl}${template.preview_image.replace('/static', '')}`} 
                            alt="Miniature uploadée" 
                            className="max-h-[600px] w-auto object-contain shadow-sm rounded-md"
                        />
                    </div>
                ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune prévisualisation</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Cliquez sur &quot;Générer la prévisualisation&quot; pour voir le template avec des données d&apos;exemple.
                        </p>
                    </div>
                )
            )}
        </div>
    )
}
