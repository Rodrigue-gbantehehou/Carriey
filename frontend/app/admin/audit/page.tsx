import { auth } from '@/lib/auth'
import config from '@/lib/config'
import Link from 'next/link'

async function getLogs(token: string) {
    const res = await fetch(`${config.apiBaseUrl}/admin/audit-logs/`, {
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
    const session = await auth()
    const logs = await getLogs(session!.user.accessToken)

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Logs Système</h1>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entité</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Entité</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {logs.map((log: any) => (
                            <tr key={log.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(log.created_at).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {log.action}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {log.entity}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {log.entity_id}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
