import { auth } from '@/lib/auth'
import Link from 'next/link'
import config from '@/lib/config'
import TemplateActions from './actions'
import TemplatePreview from './preview'
import { ChevronLeft, ShieldCheck, Eye, Settings, FileText } from 'lucide-react'

async function getTemplate(id: string, token: string) {
    const res = await fetch(`${config.apiBaseUrl}/admin/templates/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`
        },
        cache: 'no-store'
    })

    if (!res.ok) {
        throw new Error('Template introuvable')
    }

    return res.json()
}

async function getTemplateAssets(id: string, token: string) {
    try {
        const res = await fetch(`${config.apiBaseUrl}/admin/templates/${id}/assets`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            cache: 'no-store'
        })

        if (!res.ok) {
            return []
        }

        return res.json()
    } catch (error) {
        console.error('Erreur lors du chargement des assets:', error)
        return []
    }
}

function formatPrice(price: string, currency: string) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currency === 'XOF' ? 'XOF' : 'EUR',
        minimumFractionDigits: 0
    }).format(parseFloat(price))
}

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

export default async function AdminTemplateDetailPage({ params }: { params: { id: string } }) {
    const session = await auth()
    const template = await getTemplate(params.id, session!.user.accessToken)
    const assets = await getTemplateAssets(params.id, session!.user.accessToken)

    const definition = template.definition || {}

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <Link 
                                href="/admin/templates" 
                                className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5 mr-2" />
                                Retour aux templates
                            </Link>
                            <div className="h-6 w-px bg-gray-300"></div>
                            <h1 className="text-2xl font-bold text-gray-900">{template.name}</h1>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                template.is_active 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                <span className={`w-2 h-2 mr-2 rounded-full ${
                                    template.is_active ? 'bg-green-400' : 'bg-red-400'
                                }`}></span>
                                {template.is_active ? 'Actif' : 'Inactif'}
                            </span>
                            {template.is_system && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                    <ShieldCheck className="w-4 h-4 mr-1" />
                                    Système
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Colonne principale - Prévisualisation et détails */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Prévisualisation */}
                        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                            <div className="px-6 py-4 border-b bg-gray-50">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <Eye className="w-5 h-5 mr-2 text-gray-600" />
                                    Prévisualisation
                                </h2>
                            </div>
                            <div className="p-6">
                                <TemplatePreview template={template} />
                            </div>
                        </div>

                        {/* Configuration du template */}
                        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                            <div className="px-6 py-4 border-b bg-gray-50">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <Settings className="w-5 h-5 mr-2 text-gray-600" />
                                    Configuration Technique
                                </h2>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* Polices */}
                                {definition.fonts && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 mb-3">Typographie</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <div className="text-xs text-gray-500 mb-1">Titres</div>
                                                <div className="font-mono text-sm">{definition.fonts.heading || 'Non défini'}</div>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <div className="text-xs text-gray-500 mb-1">Corps de texte</div>
                                                <div className="font-mono text-sm">{definition.fonts.body || 'Non défini'}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Couleurs */}
                                {definition.colors && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 mb-3">Palette de couleurs</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {Object.entries(definition.colors).map(([key, color]) => (
                                                <div key={key} className="bg-gray-50 rounded-lg p-3">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <div 
                                                            className="w-6 h-6 rounded border border-gray-300" 
                                                            style={{ backgroundColor: color as string }}
                                                        ></div>
                                                        <span className="text-xs text-gray-600 capitalize">{key}</span>
                                                    </div>
                                                    <div className="font-mono text-xs text-gray-700">{String(color)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Layout */}
                                {definition.layout && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 mb-3">Mise en page</h3>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                {Object.entries(definition.layout).map(([key, value]) => (
                                                    <div key={key} className="flex justify-between">
                                                        <span className="text-gray-600 capitalize">{key}:</span>
                                                        <span className="font-medium text-gray-900">
                                                            {typeof value === 'boolean' ? (value ? 'Oui' : 'Non') : String(value)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Sections */}
                                {definition.sections && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 mb-3">Sections disponibles</h3>
                                        <div className="space-y-2">
                                            {definition.sections.map((section: any, index: number) => (
                                                <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                                                    <div className="flex items-center space-x-3">
                                                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                        <span className="font-medium text-gray-900">{section.label}</span>
                                                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                                                            {section.type}
                                                        </span>
                                                    </div>
                                                    {section.required && (
                                                        <span className="text-xs text-orange-600 font-medium">Requis</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Fichiers sources */}
                        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                            <div className="px-6 py-4 border-b bg-gray-50">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <FileText className="w-5 h-5 mr-2 text-gray-600" />
                                    Fichiers sources
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-3">
                                    {assets.map((asset: any) => (
                                        <div key={asset.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-8 h-8 rounded flex items-center justify-center ${
                                                    asset.type === 'css' ? 'bg-blue-100 text-blue-600' :
                                                    asset.type === 'jinja' ? 'bg-green-100 text-green-600' :
                                                    asset.type === 'json' ? 'bg-yellow-100 text-yellow-600' :
                                                    'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {asset.type === 'css' && 'CSS'}
                                                    {asset.type === 'jinja' && 'J2'}
                                                    {asset.type === 'json' && 'JSON'}
                                                    {asset.type === 'preview' && 'IMG'}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{asset.file_path.split('/').pop()}</div>
                                                    <div className="text-xs text-gray-500">{asset.type.toUpperCase()}</div>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {formatDate(asset.created_at)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Colonne latérale - Informations et actions */}
                    <div className="space-y-6">
                        {/* Carte d'informations */}
                        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                            <div className="px-6 py-4 border-b bg-gray-50">
                                <h2 className="text-lg font-semibold text-gray-900">Informations</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <div className="text-sm text-gray-500">Identifiant</div>
                                    <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{template.id}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Slug</div>
                                    <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{template.slug}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Dossier</div>
                                    <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{template.folder_name}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Version</div>
                                    <div className="font-medium">v{template.version}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Prix</div>
                                    <div className="text-xl font-bold text-gray-900">
                                        {formatPrice(template.price, template.currency)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Créé le</div>
                                    <div className="text-sm">{formatDate(template.created_at)}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Modifié le</div>
                                    <div className="text-sm">{formatDate(template.updated_at)}</div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                            <div className="px-6 py-4 border-b bg-gray-50">
                                <h2 className="text-lg font-semibold text-gray-900">Actions</h2>
                            </div>
                            <div className="p-6">
                                <TemplateActions template={template} token={session!.user.accessToken} />
                            </div>
                        </div>

                        {/* Statistiques */}
                        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                            <div className="px-6 py-4 border-b bg-gray-50">
                                <h2 className="text-lg font-semibold text-gray-900">Statistiques</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Utilisations</span>
                                    <span className="font-semibold text-gray-900">--</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Téléchargements</span>
                                    <span className="font-semibold text-gray-900">--</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Note moyenne</span>
                                    <span className="font-semibold text-gray-900">--</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
