import { useState, useEffect } from 'react';
import { API_BASE } from '@/lib/api';

export interface SubscriptionPlan {
  id: string;
  name: string;
  code: string;
  price: number;
  currency: string;
  duration_days: number;
  features: any;
}

export function usePlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch(`${API_BASE}/plans`);
        if (!res.ok) throw new Error('Erreur réseau');
        const data = await res.json();
        setPlans(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const getPlanByCode = (code: string) => plans.find(p => p.code === code);

  return { plans, loading, error, getPlanByCode };
}
