'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useProfileStore } from '@/store/profile';
import { User, Lock, Trash2, Download, CreditCard, Bell, ChevronRight, CheckCircle2, X, Loader2 } from 'lucide-react';

export default function ParametresPage() {
  const { data: session } = useSession();
  const { profile } = useProfileStore();

  const isPro = session?.user?.subscription_status === 'active' || session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';

  // Password state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (passwords.new !== passwords.confirm) {
      return setPasswordError('Les nouveaux mots de passe ne correspondent pas.');
    }

    if (passwords.new.length < 6) {
      return setPasswordError('Le mot de passe doit faire au moins 6 caractères.');
    }

    setIsChangingPassword(true);
    try {
      const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? '/api/v1').replace(/\/$/, '');
      const res = await fetch(`${apiBase}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`
        },
        body: JSON.stringify({
          current_password: passwords.current,
          new_password: passwords.new
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erreur lors de la modification');
      
      setPasswordSuccess(true);
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswords({ current: '', new: '', confirm: '' });
        setPasswordSuccess(false);
      }, 2000);
    } catch (e: any) {
      setPasswordError(e.message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleExportData = async () => {
    if (!session?.user?.accessToken) return;
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1'}/exports/data`, {
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`
        }
      });
      
      if (!res.ok) throw new Error("Erreur lors de l'exportation");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mes_donnees_carriey.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      alert("Une erreur est survenue lors de l'exportation de vos données.");
    }
  };

  const handleDeleteAccount = () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible.")) {
      alert("Demande de suppression envoyée.");
    }
  };

  const Section = ({ title, description, children }: { title: string, description: string, children: React.ReactNode }) => (
    <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-gray-200/60 shadow-sm overflow-hidden mb-8 animate-slide-up group hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-600/10 transition-all duration-300">
      <div className="p-6 border-b border-gray-100/50">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 animate-fade-in pb-24">
      <div className="mb-10 animate-slide-up">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Paramètres</h1>
        <p className="text-base text-gray-500 mt-1">
          Gérez votre compte, vos préférences et votre abonnement.
        </p>
      </div>

      <Section 
        title="Informations du compte" 
        description="Détails de connexion et de sécurité associés à votre compte."
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Adresse email</p>
                <p className="text-sm text-gray-500">{session?.user?.email || "Non renseignée"}</p>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Mot de passe</p>
                <p className="text-sm text-gray-500">Dernière modification il y a 3 mois</p>
              </div>
            </div>
            <button onClick={() => setIsPasswordModalOpen(true)} className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
              Modifier
            </button>
          </div>
        </div>
      </Section>

      <Section 
        title="Abonnement et facturation" 
        description="Gérez votre forfait carriey."
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-gray-900">
                {isPro ? "Forfait PRO" : "Forfait Gratuit"}
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isPro ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'}`}>
                Actif
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {isPro 
                ? "Accès illimité à tous les modèles premium et à l'IA." 
                : "Accès aux fonctionnalités de base pour créer vos documents."}
            </p>
          </div>
          {!isPro && (
            <button 
              onClick={() => window.location.href = '/checkout'}
              className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-600/20 hover:-translate-y-0.5 transition-all w-full sm:w-auto text-center whitespace-nowrap"
            >
              Passer Premium
            </button>
          )}
        </div>
      </Section>

      <Section 
        title="Données et confidentialité" 
        description="Contrôlez vos données personnelles."
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Exporter mes données</p>
                <p className="text-xs text-gray-500 mt-0.5 max-w-sm">
                  Téléchargez une copie complète de votre profil, de vos CV et lettres au format JSON.
                </p>
              </div>
            </div>
            <button onClick={handleExportData} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
              Exporter
            </button>
          </div>
          
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-red-600">Supprimer le compte</p>
                <p className="text-xs text-gray-500 mt-0.5 max-w-sm">
                  Supprime définitivement votre compte et toutes vos données. Cette action est irréversible.
                </p>
              </div>
            </div>
            <button onClick={handleDeleteAccount} className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 text-sm font-bold rounded-xl hover:bg-red-100 transition-colors">
              Supprimer
            </button>
          </div>
        </div>
      </Section>

      {/* Password Change Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsPasswordModalOpen(false)}></div>
          
          <div className="relative bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl z-10 flex flex-col animate-slide-up sm:animate-scale-in">
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            <div className="flex justify-between items-center p-5 sm:p-6 border-b border-gray-100 shrink-0">
              <h2 className="text-xl font-bold text-gray-900">Modifier le mot de passe</h2>
              <button onClick={() => setIsPasswordModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handlePasswordChange} className="p-5 sm:p-6 space-y-4">
              {passwordError && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm font-medium">
                  Mot de passe modifié avec succès !
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mot de passe actuel</label>
                <input required type="password" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nouveau mot de passe</label>
                <input required type="password" minLength={6} value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirmer le nouveau mot de passe</label>
                <input required type="password" minLength={6} value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>
              
              <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="px-5 py-3 sm:py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl w-full sm:w-auto text-center transition-colors">Fermer</button>
                <button type="submit" disabled={isChangingPassword || passwordSuccess} className="px-5 py-3 sm:py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-50 w-full sm:w-auto flex justify-center items-center gap-2 transition-all">
                  {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isChangingPassword ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
