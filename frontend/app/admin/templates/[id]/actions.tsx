'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import config from '@/lib/config'

export default function TemplateActions({ template, token }: { template: any, token: string }) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const toggleActive = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`${config.apiBaseUrl}/admin/templates/${template.id}/toggle`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (res.ok) {
                router.refresh()
            } else {
                alert("Erreur lors de la modification")
            }
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="mt-6 flex space-x-3">
            <button
                onClick={toggleActive}
                disabled={isLoading}
                className={`px-4 py-2 border rounded shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${template.is_active
                        ? 'border-red-300 text-red-700 bg-white hover:bg-red-50 focus:ring-red-500'
                        : 'border-green-300 text-green-700 bg-white hover:bg-green-50 focus:ring-green-500'
                    }`}
            >
                {template.is_active ? 'Désactiver' : 'Activer'}
            </button>

            <a
                href={`/admin/templates/${template.id}/edit`}
                className="px-4 py-2 border border-gray-300 rounded shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                Modifier
            </a>
        </div>
    )
}
