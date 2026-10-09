import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import config from '@/lib/config'
import Link from 'next/link'

async function getLogs(token: string) {
    const res = await fetch(`${config.apiBaseUrl}/admin/audit/`, {
        headers: {
            Authorization: `Bearer ${token}`
        },
        cache: 'no-store'
    })

    if (!res.ok) {
        throw new Error('Impossible de charger les logs')
    }

    return res.json()
}

export default async function AdminAuditPage() {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.accessToken) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900 mb-1">Logs Système</h1>
                    <p className="text-sm text-gray-500">Historique des actions importantes sur la plateforme.</p>
                </div>
                <p className="text-sm text-red-600">Session expirée. Veuillez vous reconnecter.</p>
            </div>
        )
    }

    let logs: any[] = []
    try {
        logs = await getLogs(session.user.accessToken)
    } catch (e) {
        console.error('[AdminAuditPage] Failed to fetch logs:', e)
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-semibold text-gray-900 mb-1">Logs Système</h1>
                <p className="text-sm text-gray-500">Historique des actions importantes sur la plateforme.</p>
            </div>

            <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Entité</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID Entité</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {logs.map((log: any) => (
                            <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(log.created_at).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                    {log.action}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {log.entity}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-400">
                                    {log.entity_id}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        </div>
    )
}
