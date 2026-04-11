'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import config from '@/lib/config'

export default function DebugTemplatesPage() {
  const { data: session, status } = useSession()
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    const testAPI = async () => {
      const info: any = {
        session: session,
        status: status,
        apiBaseUrl: config.apiBaseUrl,
        envApiUrl: process.env.NEXT_PUBLIC_API_URL,
        hasToken: !!session?.user?.accessToken,
        tokenPreview: session?.user?.accessToken ? session.user.accessToken.substring(0, 20) + '...' : 'none'
      }

      // Test API call
      if (session?.user?.accessToken) {
        try {
          const response = await fetch(`${config.apiBaseUrl}/admin/templates/`, {
            headers: {
              'Authorization': `Bearer ${session.user.accessToken}`,
              'Content-Type': 'application/json'
            }
          })
          
          info.apiResponse = {
            status: response.status,
            ok: response.ok,
            statusText: response.statusText
          }
          
          if (response.ok) {
            const data = await response.json()
            info.apiData = data
          } else {
            const errorData = await response.text()
            info.apiError = errorData
          }
        } catch (error: any) {
          info.apiError = error.message || 'Unknown error'
        }
      }

      setDebugInfo(info)
    }

    testAPI()
  }, [session, status])

  if (status === 'loading') {
    return <div>Chargement...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Templates API</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-bold mb-2">État de l&apos;authentification:</h2>
        <pre className="text-sm">
          {JSON.stringify({
            status: status,
            hasSession: !!session,
            hasToken: !!session?.user?.accessToken,
            userEmail: session?.user?.email,
            userRole: session?.user?.role
          }, null, 2)}
        </pre>
      </div>

      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-bold mb-2">Configuration:</h2>
        <pre className="text-sm">
          {JSON.stringify({
            apiBaseUrl: config.apiBaseUrl,
            envApiUrl: process.env.NEXT_PUBLIC_API_URL,
            tokenPreview: session?.user?.accessToken ? session.user.accessToken.substring(0, 20) + '...' : 'none'
          }, null, 2)}
        </pre>
      </div>

      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-bold mb-2">Résultat de l&apos;API:</h2>
        <pre className="text-sm">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>

      <div className="mt-4">
        <a href="/admin/templates" className="bg-blue-500 text-white px-4 py-2 rounded">
          Retour aux templates
        </a>
      </div>
    </div>
  )
}
