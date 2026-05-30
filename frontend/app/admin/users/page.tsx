'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import config from '@/lib/config'
import { toast } from 'react-hot-toast'

interface User {
  id: string
  email: string
  full_name: string | null
  role: string
  is_active: boolean
  created_at: string
}

export default function UsersAdmin() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${config.apiBaseUrl}/admin/users/`, {
          headers: {
            'Authorization': `Bearer ${session?.user?.accessToken}`
          }
        })
        if (res.status === 401) {
          toast.error("Session expirée. Veuillez vous reconnecter.");
          const { signOut } = await import('next-auth/react');
          signOut({ callbackUrl: '/login' });
          return;
        }
        if (!res.ok) throw new Error('Erreur lors du chargement des utilisateurs')
        const data = await res.json()
        setUsers(data)
      } catch (err: any) {
        toast.error(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.accessToken) {
      fetchUsers()
    }
  }, [session])

  const handleToggleActive = async (user: User) => {
    setUpdatingId(user.id)
    try {
      const res = await fetch(`${config.apiBaseUrl}/admin/users/${user.id}/toggle-active`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`
        }
      })
      if (!res.ok) throw new Error('Erreur lors de la modification du statut')
      const data = await res.json()
      
      setUsers(users.map(u => u.id === user.id ? { ...u, is_active: data.is_active } : u))
      toast.success(`Utilisateur ${data.is_active ? 'activé' : 'désactivé'}`)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleUpdateRole = async (userId: string, newRole: string) => {
    setUpdatingId(userId)
    try {
      const res = await fetch(`${config.apiBaseUrl}/admin/users/${userId}/role?new_role=${newRole}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`
        }
      })
      if (!res.ok) throw new Error('Erreur lors de la modification du rôle')
      
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
      toast.success('Rôle mis à jour')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Utilisateurs</h1>
        <p className="text-gray-500">Gérez les accès, les rôles et le statut des utilisateurs de la plateforme.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Utilisateur</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Rôle</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Statut</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{user.full_name || 'Sans nom'}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={user.role} 
                      onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                      disabled={updatingId === user.id}
                      className="text-xs font-bold py-1 px-2 rounded bg-gray-100 border-none outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="user">USER</option>
                      <option value="admin">ADMIN</option>
                      <option value="super_admin">SUPER ADMIN</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                      user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.is_active ? 'Actif' : 'Désactivé'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleToggleActive(user)}
                      disabled={updatingId === user.id}
                      className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${
                        user.is_active 
                        ? 'text-red-600 bg-red-50 hover:bg-red-600 hover:text-white' 
                        : 'text-green-600 bg-green-50 hover:bg-green-600 hover:text-white'
                      }`}
                    >
                      {user.is_active ? 'Désactiver' : 'Activer'}
                    </button>
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
