'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Script from 'next/script';

import { CreditCard, Lock, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import config from '@/lib/config';

import { Suspense } from 'react';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const type = searchParams.get('type') || 'pro'; // 'pro' or 'single'

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'mobile'

  const [dynamicPlan, setDynamicPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const templateId = searchParams.get('templateId');

    if (type === 'pro') {
      // Pour l'abonnement
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/plans`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const found = data.find(p => p.duration_days > 0) || data[0];
            if (found) {
              setDynamicPlan({
                code: found.code,
                name: found.name,
                price: found.price,
                currency: found.currency,
                desc: found.features?.description || 'Accès illimité'
              });
            }
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else if (type === 'single' && templateId) {
      // Pour l'achat unique d'un modèle
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/templates`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            // Le templateId peut être un ID ou un slug. On vérifie les deux.
            const found = data.find(t => t.id === templateId || t.slug === templateId);
            if (found) {
              setDynamicPlan({
                code: 'single', // Utile pour le backend
                template_id: found.id,
                name: `Modèle Premium : ${found.name}`,
                price: found.price,
                currency: found.currency || "XOF",
                desc: 'Débloquez ce modèle à vie pour vos documents.'
              });
            }
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [type, searchParams]);

  const plan = dynamicPlan || (type === 'pro'
    ? { name: 'Pass carriey PRO', price: 1500, currency: 'F CFA', desc: 'Accès illimité à tous les modèles et à l\'IA.' }
    : { name: 'Achat Unique', price: 2000, currency: 'F CFA', desc: 'Débloquez votre modèle de CV à vie.' });

  useEffect(() => {
    if (status === 'unauthenticated') {
      // Si l'utilisateur n'est pas connecté, il devrait se connecter avant de payer
      router.push(`/login?callbackUrl=/checkout?type=${type}`);
    }
  }, [status, router, type]);

  const handlePayment = async () => {
    if (!session?.user?.accessToken) {
      router.push(`/login?callbackUrl=/checkout?type=${type}`);
      return;
    }

    setIsProcessing(true);

    try {
      // On utilise le code récupéré dynamiquement, ou on fallback
      const targetCode = dynamicPlan?.code || (type === 'pro' ? 'pro_14' : 'single');
      const templateIdToSend = dynamicPlan?.template_id || searchParams.get('templateId');

      const payload: any = {
        amount: parseFloat(plan.price),
        currency: plan.currency || "XOF",
        provider: "kkiapay" // On force kkiapay pour l'instant
      };

      if (type === 'pro') {
        payload.plan_code = targetCode;
      } else {
        payload.plan_code = targetCode;
        if (templateIdToSend) payload.template_id = templateIdToSend;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/payments/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Erreur lors de l'initialisation du paiement.");
      }

      if (data.status === 'already_paid') {
        alert("Vous avez déjà débloqué ce modèle !");
        router.push('/mes-documents');
        return;
      }

      // Kkiapay utilise un widget. On récupère la config du backend.
      const config = data.provider_config;
      const transactionId = data.transaction_id;

      if (!config) {
        throw new Error("Configuration de paiement manquante depuis le serveur.");
      }

      if (typeof (window as any).openKkiapayWidget === 'undefined') {
        throw new Error("Le module de paiement sécurisé est encore en cours de chargement. Veuillez patienter quelques secondes et réessayer.");
      }

      (window as any).openKkiapayWidget({
        amount: config.amount,
        position: "center",
        callback: config.callback, // webhook fallback url or success url
        data: transactionId,
        theme: config.theme,
        key: config.public_key,
        sandbox: config.sandbox
      });

      // On arrête le spinner immédiatement car le widget modal Kkiapay prend le relais
      // (Cela évite que le bouton tourne à l'infini si l'utilisateur ferme le widget)
      setIsProcessing(false);

      // Ajouter le listener pour quand c'est validé avec succès
      (window as any).addKkiapayListener('success', (response: any) => {
        console.log("Kkiapay success:", response);
        router.push('/mes-documents?payment_success=true');
      });
    } catch (error: any) {
      console.error("Payment error:", error);
      alert(error.message || "Une erreur est survenue lors de l'initialisation du paiement.");
      setIsProcessing(false);
    }
  };

  // Supprimé le chargement manuel du script via useEffect
  // On utilise next/script dans le JSX à la place

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Script src="https://cdn.kkiapay.me/k.js" strategy="lazyOnload" />

      <main className="flex-1 py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">

          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-gray-900 mb-4">Finaliser votre commande</h1>
            <p className="text-gray-500 flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Paiement 100% sécurisé
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">

            {/* Récapitulatif de la commande */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-fit">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Récapitulatif</h2>

              <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-100">
                <div>
                  <h3 className="font-bold text-gray-800">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{plan.desc}</p>
                </div>
                <div className="text-right">
                  <span className="font-black text-xl text-gray-900">{plan.price}</span>
                  <span className="text-sm font-bold text-gray-500 ml-1">{plan.currency}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-lg font-black text-indigo-900">
                <span>Total à payer</span>
                <span>{plan.price} {plan.currency}</span>
              </div>
            </div>

            {/* Moyen de paiement */}
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Moyen de paiement</h2>

                {/* Options de paiement temporairement masquées 
                <div className="space-y-4 mb-8">
                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-100 hover:border-gray-200'}`}>
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-600"
                    />
                    <div className="flex-1 flex items-center justify-between">
                      <span className="font-bold text-gray-900">Carte Bancaire (Stripe)</span>
                      <CreditCard className="w-5 h-5 text-gray-400" />
                    </div>
                  </label>

                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'mobile' ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-100 hover:border-gray-200'}`}>
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value="mobile"
                      checked={paymentMethod === 'mobile'}
                      onChange={() => setPaymentMethod('mobile')}
                      className="w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-600"
                    />
                    <div className="flex-1 flex items-center justify-between">
                      <span className="font-bold text-gray-900">Mobile Money (FedaPay)</span>
                      <div className="flex gap-1">
                        <div className="w-8 h-5 bg-orange-500 rounded text-[8px] font-bold text-white flex items-center justify-center">OM</div>
                        <div className="w-8 h-5 bg-yellow-400 rounded text-[8px] font-bold text-black flex items-center justify-center">MOMO</div>
                      </div>
                    </div>
                  </label>
                </div>
                */}



                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full py-4 px-6 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Connexion sécurisée...</>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Payer {plan.price} {plan.currency}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-gray-400 mt-4">
                  Vos informations de paiement sont chiffrées et sécurisées par nos partenaires.
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>

    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#00C896] w-8 h-8" /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
