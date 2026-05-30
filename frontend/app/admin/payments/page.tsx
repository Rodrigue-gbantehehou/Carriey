'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import config from '@/lib/config'
import { toast } from 'react-hot-toast'

interface Payment {
  id: string
  user_email: string
  template_name: string
  amount: number
  currency: string
  status: string
  provider: string
  provider_payment_id: string | null
  created_at: string
  meta_data: any
}

export default function PaymentsAdmin() {
  const { data: session } = useSession()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const url = filter 
          ? `${config.apiBaseUrl}/admin/payments/?status=${filter}`
          : `${config.apiBaseUrl}/admin/payments/`
          
        const res = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${session?.user?.accessToken}`
          }
        })
        if (!res.ok) throw new Error('Erreur lors du chargement des paiements')
        const data = await res.json()
        setPayments(data)
      } catch (err: any) {
        toast.error(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.accessToken) {
      fetchPayments()
    }
  }, [session, filter])

  const handleConfirmPayment = async (paymentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir valider ce paiement manuellement ?')) return
    
    setUpdatingId(paymentId)
    try {
      const res = await fetch(`${config.apiBaseUrl}/admin/payments/${paymentId}/confirm`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`
        }
      })
      if (!res.ok) throw new Error('Erreur lors de la validation')
      
      setPayments(payments.map(p => p.id === paymentId ? { ...p, status: 'success' } : p))
      toast.success('Paiement validé manuellement')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Paiements</h1>
          <p className="text-gray-500">Suivez les transactions et gérez les validations manuelles.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Filtrer:</label>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Tous les statuts</option>
            <option value="success">Réussis</option>
            <option value="pending">En attente</option>
            <option value="failed">Échoués</option>
            <option value="cancelled">Annulés</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Client / Modèle</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Montant</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Méthode</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Statut</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500 italic">
                    Aucun paiement trouvé.
                  </td>
                </tr>
              ) : (
                payments.map(payment => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{payment.user_email}</div>
                      <div className="text-sm text-gray-400">{payment.template_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{payment.amount.toLocaleString()} {payment.currency}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-bold uppercase">
                        {payment.provider}
                      </span>
                      <div className="text-[10px] text-gray-400 mt-1 font-mono">{payment.provider_payment_id || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                        payment.status === 'success' ? 'bg-green-100 text-green-700' : 
                        payment.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {payment.status === 'success' ? 'Réussi' : 
                         payment.status === 'pending' ? 'En attente' : 
                         payment.status === 'failed' ? 'Échoué' : 'Annulé'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(payment.created_at).toLocaleString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {payment.status !== 'success' && (
                        <button 
                          onClick={() => handleConfirmPayment(payment.id)}
                          disabled={updatingId === payment.id}
                          className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"
                        >
                          Valider
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
