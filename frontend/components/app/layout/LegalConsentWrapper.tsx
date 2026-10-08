'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import config from '@/lib/config';
import { Loader2, ShieldAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function LegalConsentWrapper({ children }: { children: React.ReactNode }) {
  const { data: session, update, status } = useSession();
  const [isAccepting, setIsAccepting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const userVersion = session.user.accepted_terms_version || '1.0';
      const currentVersion = config.legal.currentTermsVersion;
      if (userVersion !== currentVersion) {
        setShowModal(true);
      } else {
        setShowModal(false);
      }
    }
  }, [session, status]);

  const handleAccept = async () => {
    if (!session?.user?.accessToken) return;
    setIsAccepting(true);
    try {
      const res = await fetch(`${config.apiBaseUrl}/auth/accept-terms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify({ version: config.legal.currentTermsVersion }),
      });

      if (!res.ok) throw new Error('Erreur lors de l\'acceptation');
      
      // Mettre à jour la session localement pour refléter la nouvelle version
      await update({
        ...session,
        user: {
          ...session.user,
          accepted_terms_version: config.legal.currentTermsVersion
        }
      });
      
      toast.success('Merci d\'avoir accepté les nouvelles conditions !');
      setShowModal(false);
    } catch (error) {
      toast.error('Impossible d\'enregistrer votre consentement. Veuillez réessayer.');
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <>
      {children}
      {showModal && (
        <div className="fixed inset-0 z-[9999] bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 text-center sm:text-left">
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-6 mx-auto sm:mx-0">
                <ShieldAlert className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Mise à jour de nos Conditions
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Nous avons récemment mis à jour nos Conditions Générales d'Utilisation (CGU) et notre Politique de Confidentialité. 
                Pour continuer à utiliser carriey, veuillez prendre connaissance des changements et accepter les nouvelles conditions.
              </p>
              
              <div className="bg-gray-50 rounded-xl p-4 mb-8">
                <ul className="text-sm font-medium text-indigo-600 flex flex-col gap-3">
                  <li>
                    <Link href="/legal/cgu" target="_blank" className="hover:underline flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                      Lire les nouvelles CGU
                    </Link>
                  </li>
                  <li>
                    <Link href="/legal/privacy" target="_blank" className="hover:underline flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                      Lire la nouvelle Politique de Confidentialité
                    </Link>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleAccept}
                disabled={isAccepting}
                className="w-full flex justify-center items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 transition-all"
              >
                {isAccepting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'J\'accepte les nouvelles conditions'}
              </button>
              <p className="text-center text-xs text-gray-400 mt-4">
                En cliquant sur J'accepte, vous confirmez avoir lu et approuvé l'ensemble de nos politiques légales mises à jour.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
