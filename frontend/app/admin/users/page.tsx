'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import config from '@/lib/config'
import { toast } from 'react-hot-toast'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageContainer } from '@/components/ui/PageContainer'
import { Button } from '@/components/ui/Button'

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
        const res = await fetch(`${config.apiBaseUrl}/admin/users`, {
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <PageContainer variant="dashboard" className="space-y-6 py-6">
      <PageHeader 
        title="Gestion des Utilisateurs" 
        description="Gérez les accès, les rôles et le statut des utilisateurs de la plateforme." 
      />

      <div className="bg-background rounded-panel border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-ui-sm">
            <thead>
              <tr className="bg-background-subtle border-b border-border">
                <th className="px-6 py-3 text-ui-xs font-semibold text-text-muted uppercase tracking-wider">Utilisateur</th>
                <th className="px-6 py-3 text-ui-xs font-semibold text-text-muted uppercase tracking-wider">Rôle</th>
                <th className="px-6 py-3 text-ui-xs font-semibold text-text-muted uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-ui-xs font-semibold text-text-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-background-subtle transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-text-primary">{user.full_name || 'Sans nom'}</div>
                    <div className="text-text-muted">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={user.role} 
                      onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                      disabled={updatingId === user.id}
                      className="text-ui-sm font-medium py-1.5 px-3 rounded-field bg-background border border-border outline-none focus:ring-2 focus:ring-primary text-text-primary"
                    >
                      <option value="user">USER</option>
                      <option value="admin">ADMIN</option>
                      <option value="super_admin">SUPER ADMIN</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-ui-xs font-medium ${
                      user.is_active ? 'bg-success-bg text-success-text border border-success-text/20' : 'bg-danger-bg text-danger-text border border-danger-text/20'
                    }`}>
                      {user.is_active ? 'Actif' : 'Désactivé'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => window.location.href = `/admin/users/${user.id}`}
                        >
                            Profil
                        </Button>
                        <Button
                          variant={user.is_active ? 'danger' : 'primary'}
                          size="sm"
                          onClick={() => handleToggleActive(user)}
                          isLoading={updatingId === user.id}
                        >
                          {user.is_active ? 'Désactiver' : 'Activer'}
                        </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  )
}

