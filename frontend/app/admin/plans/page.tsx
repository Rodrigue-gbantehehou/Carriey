'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { API_BASE } from '@/lib/api';
import { Pencil, Check, X, Loader2 } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  code: string;
  price: number;
  currency: string;
  duration_days: number;
  is_active: boolean;
  features: any;
}

export default function AdminPlansPage() {
  const { data: session } = useSession();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Plan>>({});

  useEffect(() => {
    fetchPlans();
  }, [session]);

  const fetchPlans = async () => {
    if (!session?.user?.accessToken) return;
    try {
      const res = await fetch(`${API_BASE}/plans/admin`, {
        headers: { Authorization: `Bearer ${session.user.accessToken}` }
      });
      if (res.ok) {
        setPlans(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan.id);
    setEditForm({ 
      price: plan.price, 
      duration_days: plan.duration_days, 
      name: plan.name,
      features: plan.features
    });
  };

  const handleSave = async (id: string) => {
    if (!session?.user?.accessToken) return;
    
    // Convertir features de string à objet si c'est une string
    const payload = { ...editForm };
    if (typeof payload.features === 'string') {
      try {
        payload.features = JSON.parse(payload.features);
      } catch (e) {
        alert('Le format JSON du contenu est invalide.');
        return;
      }
    }

    try {
      const res = await fetch(`${API_BASE}/plans/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.user.accessToken}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setEditingPlan(null);
        fetchPlans();
        alert('Plan mis à jour avec succès !');
      } else {
        alert('Erreur lors de la mise à jour.');
      }
    } catch (e) {
      console.error(e);
      alert('Erreur réseau.');
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Gestion des Tarifs</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-semibold text-sm text-gray-600">Nom / Code</th>
              <th className="p-4 font-semibold text-sm text-gray-600">Prix</th>
              <th className="p-4 font-semibold text-sm text-gray-600">Durée (Jours)</th>
              <th className="p-4 font-semibold text-sm text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {plans.map(plan => (
              <React.Fragment key={plan.id}>
                <tr className="hover:bg-gray-50/50">
                  <td className="p-4">
                    {editingPlan === plan.id ? (
                      <input 
                        type="text" 
                        value={editForm.name} 
                        onChange={e => setEditForm({...editForm, name: e.target.value})}
                        className="border p-1 rounded text-sm w-full"
                      />
                    ) : (
                      <div>
                        <div className="font-bold text-gray-900">{plan.name}</div>
                        <div className="text-xs text-gray-400">{plan.code}</div>
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    {editingPlan === plan.id ? (
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          value={editForm.price} 
                          onChange={e => setEditForm({...editForm, price: parseFloat(e.target.value)})}
                          className="border p-1 rounded text-sm w-24"
                        />
                        <span className="text-xs text-gray-500">{plan.currency}</span>
                      </div>
                    ) : (
                      <div className="font-bold text-gray-700">{plan.price} {plan.currency}</div>
                    )}
                  </td>
                  <td className="p-4">
                    {editingPlan === plan.id ? (
                      <input 
                        type="number" 
                        value={editForm.duration_days} 
                        onChange={e => setEditForm({...editForm, duration_days: parseInt(e.target.value)})}
                        className="border p-1 rounded text-sm w-20"
                      />
                    ) : (
                      <div className="text-gray-600">{plan.duration_days > 0 ? `${plan.duration_days} j` : 'Permanent'}</div>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {editingPlan === plan.id ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleSave(plan.id)} className="p-1.5 bg-emerald-100 text-emerald-600 rounded hover:bg-emerald-200">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingPlan(null)} className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => handleEdit(plan)} className="p-1.5 text-indigo-600 bg-indigo-50 rounded hover:bg-indigo-100">
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
                {/* Ligne d'édition avancée du contenu (JSON) */}
                {editingPlan === plan.id && (
                  <tr>
                    <td colSpan={4} className="p-4 bg-gray-50/50 border-t border-gray-100">
                      <div className="mb-2 text-xs font-bold text-gray-600">Contenu de l'offre (Format JSON)</div>
                      <textarea
                        rows={6}
                        className="w-full text-xs font-mono p-3 border border-gray-300 rounded bg-gray-900 text-green-400"
                        value={typeof editForm.features === 'string' ? editForm.features : JSON.stringify(editForm.features, null, 2)}
                        onChange={e => setEditForm({ ...editForm, features: e.target.value })}
                        placeholder='{"description": "...", "items": [{"text": "...", "included": true}], "cta": "..."}'
                      />
                      <p className="text-[10px] text-gray-500 mt-1">Vous pouvez modifier la description, les listes incluses/exclues et le texte du bouton.</p>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
