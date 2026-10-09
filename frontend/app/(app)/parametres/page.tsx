'use client';
import config from '@/lib/config';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useProfileStore } from '@/store/profile';
import { User, Lock, Trash2, Download, CreditCard, Bell, ChevronRight, CheckCircle2, X, Loader2, ExternalLink, AlertTriangle, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';

export default function ParametresPage() {
  const { data: session } = useSession();
  const { profile } = useProfileStore();

  const isPro = session?.user?.subscription_status === 'active' || session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';

  const [payments, setPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

  useEffect(() => {
    if (session?.user?.accessToken) {
      const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? '/api/v1').replace(/\/$/, '');
      fetch(`${apiBase}/payments/history`, {
        headers: { Authorization: `Bearer ${session.user.accessToken}` }
      })
        .then(r => r.ok ? r.json() : { payments: [] })
        .then(data => {
          setPayments(data.payments || []);
          setLoadingPayments(false);
        })
        .catch(() => setLoadingPayments(false));
    }
  }, [session?.user?.accessToken]);

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

  // GDPR Data Export state
  const [isExporting, setIsExporting] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // GDPR Account Deletion state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleExportData = async () => {
    if (!session?.user?.accessToken) return;

    setIsExporting(true);
    setExportFeedback(null);

    try {
      const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? '/api/v1').replace(/\/$/, '');
      const res = await fetch(`${apiBase}/exports/data`, {
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`
        }
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || "Erreur lors de l'exportation des données.");
      }

      // Read filename from Content-Disposition if available
      let filename = `carriey_export_${new Date().toISOString().slice(0, 10)}.json`;
      const disposition = res.headers.get('Content-Disposition');
      if (disposition && disposition.includes('filename=')) {
        const match = disposition.match(/filename=(.+?)(?:;|$)/);
        if (match && match[1]) {
          filename = match[1].replace(/['"]/g, '');
        }
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportFeedback({
        type: 'success',
        message: 'Vos données ont été téléchargées avec succès (JSON conforme RGPD).'
      });
      setTimeout(() => setExportFeedback(null), 5000);
    } catch (e: any) {
      setExportFeedback({
        type: 'error',
        message: e.message || "Une erreur est survenue lors de l'exportation de vos données."
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleConfirmDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError('');

    const confirmationMatches = deleteConfirmationText.trim().toUpperCase() === 'SUPPRIMER';
    if (!confirmationMatches && !deletePassword.trim()) {
      return setDeleteError("Veuillez saisir votre mot de passe ou taper 'SUPPRIMER' pour confirmer.");
    }

    setIsDeletingAccount(true);
    try {
      const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? '/api/v1').replace(/\/$/, '');
      const res = await fetch(`${apiBase}/auth/me`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`
        },
        body: JSON.stringify({
          password: deletePassword.trim() || undefined,
          confirmation: deleteConfirmationText.trim() || undefined
        })
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.detail || "Échec de la suppression du compte.");
      }

      // Nettoyer stockage local et déconnecter
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }

      // Déconnexion et redirection
      await signOut({ callbackUrl: '/login?deleted=1' });
    } catch (err: any) {
      setDeleteError(err.message || "Une erreur est survenue lors de la suppression de votre compte.");
      setIsDeletingAccount(false);
    }
  };

  const Section = ({ title, description, children }: { title: string, description: string, children: React.ReactNode }) => (
    <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-border/60 shadow-sm overflow-hidden mb-8 animate-slide-up group hover:border-primary/20 hover:shadow-xl hover:shadow-indigo-600/10 transition-all duration-300">
      <div className="p-6 border-b border-border/50">
        <h2 className="text-lg font-bold text-text-primary">{title}</h2>
        <p className="text-sm text-text-secondary mt-1">{description}</p>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in pb-12">
      <PageHeader
        title="Paramètres"
        description="Gérez votre compte, vos préférences et votre abonnement."
        className="animate-slide-up mb-10"
      />

      <Section
        title="Informations du compte"
        description="Détails de connexion et de sécurité associés à votre compte."
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary-subtle text-primary flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">Adresse email</p>
                <p className="text-sm text-text-secondary">{session?.user?.email || "Non renseignée"}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-background-subtle text-text-secondary flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">Mot de passe</p>
                <p className="text-sm text-text-secondary">Dernière modification il y a 3 mois</p>
              </div>
            </div>
            <button onClick={() => setIsPasswordModalOpen(true)} className="text-sm font-bold text-primary hover:text-primary-hover transition-colors">
              Modifier
            </button>
          </div>
        </div>
      </Section>

      <Section
        title="Abonnement et facturation"
        description="Gérez votre forfait carriey."
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-background-subtle/50 p-4 rounded-panel border border-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-text-primary">
                {isPro ? "Forfait PRO" : "Forfait Gratuit"}
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isPro ? 'bg-primary-subtle text-primary' : 'bg-success-bg text-success-text'}`}>
                {isPro ? 'Actif' : 'Gratuit'}
              </span>
            </div>
            <p className="text-sm text-text-secondary mb-2">
              {isPro
                ? "Accès illimité à tous les modèles premium et à l'IA."
                : "Accès aux fonctionnalités de base pour créer vos documents."}
            </p>
            {isPro && session?.user?.premium_until && (
              <p className="text-xs font-semibold text-primary bg-primary-subtle inline-block px-2 py-1 rounded-md">
                Valable jusqu'au {new Date(session.user.premium_until).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
          <div className="w-full sm:w-auto flex flex-col gap-2">
            {!isPro ? (
              <button
                onClick={() => window.location.href = '/checkout'}
                className="px-5 py-2.5 bg-primary text-white font-bold text-sm rounded-button hover:bg-primary-hover shadow-md shadow-indigo-600/20 hover:-translate-y-0.5 transition-all text-center whitespace-nowrap"
              >
                Passer Premium
              </button>
            ) : (
              <button
                onClick={() => window.location.href = '/checkout'}
                className="px-5 py-2.5 bg-white border border-border text-text-secondary font-bold text-sm rounded-button hover:bg-background-subtle shadow-sm transition-all text-center whitespace-nowrap"
              >
                Prolonger / Gérer
              </button>
            )}
          </div>
        </div>
      </Section>

      <Section
        title="Historique de paiement"
        description="Retrouvez toutes vos transactions."
      >
        <div className="bg-white border border-border rounded-panel overflow-hidden shadow-sm">
          {loadingPayments ? (
            <div className="p-8 flex justify-center items-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : payments.length === 0 ? (
            <div className="p-8 text-center text-text-secondary text-sm">
              Aucun paiement enregistré pour le moment.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-background-subtle text-text-secondary font-semibold border-b border-border">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Montant</th>
                    <th className="px-6 py-4">Statut</th>
                    <th className="px-6 py-4 text-right">Facture</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-background-subtle/50 transition-colors">
                      <td className="px-6 py-4 text-text-secondary">
                        {new Date(p.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 font-medium text-text-primary">
                        {p.plan_code ? `Abonnement ${p.plan_code}` : p.template_id ? `Modèle CV` : 'Paiement'}
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        {p.amount} {p.currency}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${p.status === 'success' ? 'bg-success-bg text-success-text' : p.status === 'pending' ? 'bg-warning-bg text-warning-text' : 'bg-danger-bg text-danger-text'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {p.status === 'success' && (
                          <button className="text-primary hover:text-indigo-800 font-semibold text-xs inline-flex items-center gap-1">
                            <Download className="w-3.5 h-3.5" /> PDF
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Section>

      <Section
        title="Données et confidentialité (RGPD)"
        description="Contrôlez vos données personnelles et exercez vos droits d'accès et d'effacement."
      >
        <div className="space-y-6">
          {exportFeedback && (
            <div className={`p-4 rounded-panel flex items-center gap-3 text-sm font-medium animate-slide-up ${
              exportFeedback.type === 'success' 
                ? 'bg-success-bg text-success-text border border-success-text/20' 
                : 'bg-danger-bg text-danger-text border border-danger-text/20'
            }`}>
              {exportFeedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-success-text shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-danger-text shrink-0" />
              )}
              <p>{exportFeedback.message}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-10 h-10 rounded-panel bg-primary-subtle text-primary flex items-center justify-center shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">Exporter mes données (Art. 15 & 20 RGPD)</p>
                <p className="text-xs text-text-secondary mt-0.5 max-w-md">
                  Téléchargez une archive complète et structurée au format JSON de votre profil, de vos CVs, candidatures et transactions.
                </p>
              </div>
            </div>
            <button 
              onClick={handleExportData} 
              disabled={isExporting}
              className="px-5 py-2.5 bg-white border border-border text-text-primary text-sm font-bold rounded-button hover:bg-background-subtle transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Download className="w-4 h-4 text-primary" />}
              {isExporting ? 'Export en cours...' : 'Exporter (JSON)'}
            </button>
          </div>

          <div className="pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-10 h-10 rounded-panel bg-danger-bg0 text-danger-text flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-danger-text">Supprimer mon compte (Art. 17 RGPD)</p>
                <p className="text-xs text-text-secondary mt-0.5 max-w-md">
                  Supprime définitivement et sans délai votre compte, vos CVs, vos photos et l'intégralité de vos données de nos serveurs.
                </p>
              </div>
            </div>
            <button 
              onClick={() => {
                setDeleteError('');
                setDeletePassword('');
                setDeleteConfirmationText('');
                setIsDeleteModalOpen(true);
              }} 
              className="px-5 py-2.5 bg-danger-bg0 text-danger-text border border-danger-text/20 text-sm font-bold rounded-button hover:bg-danger-bg transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer le compte
            </button>
          </div>
        </div>
      </Section>

      {/* Password Change Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center">
          <div className="absolute inset-0 bg-text-primary/40 backdrop-blur-sm" onClick={() => setIsPasswordModalOpen(false)}></div>

          <div className="relative bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl z-10 flex flex-col animate-slide-up sm:animate-scale-in">
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 bg-border rounded-full" />
            </div>

            <div className="flex justify-between items-center p-5 sm:p-6 border-b border-border shrink-0">
              <h2 className="text-xl font-bold text-text-primary">Modifier le mot de passe</h2>
              <button onClick={() => setIsPasswordModalOpen(false)} className="text-text-muted hover:text-text-secondary bg-background-subtle hover:bg-border p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="p-5 sm:p-6 space-y-4">
              {passwordError && (
                <div className="p-3 bg-danger-bg text-danger-text border border-danger-text/20 rounded-panel text-sm font-medium">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="p-3 bg-success-bg text-success-text border border-success-text/20 rounded-panel text-sm font-medium">
                  Mot de passe modifié avec succès !
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Mot de passe actuel</label>
                <input required type="password" value={passwords.current} onChange={e => setPasswords({ ...passwords, current: e.target.value })} className="w-full px-4 py-2.5 bg-background-subtle/50 border border-border rounded-panel focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Nouveau mot de passe</label>
                <input required type="password" minLength={6} value={passwords.new} onChange={e => setPasswords({ ...passwords, new: e.target.value })} className="w-full px-4 py-2.5 bg-background-subtle/50 border border-border rounded-panel focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Confirmer le nouveau mot de passe</label>
                <input required type="password" minLength={6} value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} className="w-full px-4 py-2.5 bg-background-subtle/50 border border-border rounded-panel focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>

              <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border">
                <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="px-5 py-3 sm:py-2.5 text-text-secondary font-bold hover:bg-border rounded-button w-full sm:w-auto text-center transition-colors">Fermer</button>
                <button type="submit" disabled={isChangingPassword || passwordSuccess} className="px-5 py-3 sm:py-2.5 bg-primary text-white font-bold rounded-button shadow-lg shadow-indigo-600/20 hover:bg-primary-hover disabled:opacity-50 w-full sm:w-auto flex justify-center items-center gap-2 transition-all">
                  {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isChangingPassword ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GDPR Account Deletion Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-4">
          <div 
            className="absolute inset-0 bg-gray-950/60 backdrop-blur-md transition-opacity" 
            onClick={() => !isDeletingAccount && setIsDeleteModalOpen(false)}
          />

          <div className="relative bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl z-10 flex flex-col border border-red-100 overflow-hidden animate-slide-up sm:animate-scale-in">
            {/* Header */}
            <div className="bg-danger-bg0 p-6 text-danger-text relative border-b border-danger-text/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-panel bg-white border border-danger-text/20 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-6 h-6 text-danger-text" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight">Supprimer définitivement mon compte</h2>
                  <p className="text-xs font-medium mt-0.5">Droit à l'effacement — Article 17 du RGPD</p>
                </div>
              </div>
              <button 
                onClick={() => !isDeletingAccount && setIsDeleteModalOpen(false)}
                disabled={isDeletingAccount}
                className="absolute top-5 right-5 text-danger-text/70 hover:text-danger-text bg-white p-2 rounded-full transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleConfirmDeleteAccount} className="p-6 space-y-5">
              <div className="bg-danger-bg border border-danger-text/20 rounded-panel p-4 text-xs text-danger-text space-y-2">
                <p className="font-bold flex items-center gap-1.5 text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Cette action est immédiate et irréversible.
                </p>
                <p className="text-text-secondary">
                  Conformément au RGPD, toutes les données associées à votre compte seront physiquement purgées de nos bases et serveurs de fichiers :
                </p>
                <ul className="list-disc pl-5 space-y-1 text-text-secondary font-medium">
                  <li>Tous vos CVs et lettres de motivation enregistrés</li>
                  <li>Vos fichiers PDF et documents générés sur le disque</li>
                  <li>Vos photos de profil et pièces jointes</li>
                  <li>Votre profil maître complet et historique de candidatures</li>
                </ul>
              </div>

              {deleteError && (
                <div className="p-3.5 bg-danger-bg text-danger-text border border-danger-text/20 rounded-panel text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}

              <div className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                    Option 1 : Votre mot de passe actuel
                  </label>
                  <input
                    type="password"
                    placeholder="Entrez votre mot de passe pour confirmer"
                    value={deletePassword}
                    onChange={(e) => {
                      setDeletePassword(e.target.value);
                      setDeleteError('');
                    }}
                    disabled={isDeletingAccount}
                    className="w-full px-4 py-2.5 bg-background-subtle border border-border rounded-panel text-sm focus:border-danger-text focus:ring-1 focus:ring-danger-text focus:bg-white outline-none transition-all"
                  />
                </div>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-border"></div>
                  <span className="flex-shrink mx-4 text-text-muted text-xs font-bold uppercase">Ou</span>
                  <div className="flex-grow border-t border-border"></div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                    Option 2 : Tapez le mot <span className="text-danger-text font-black">SUPPRIMER</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Tapez SUPPRIMER pour confirmer"
                    value={deleteConfirmationText}
                    onChange={(e) => {
                      setDeleteConfirmationText(e.target.value);
                      setDeleteError('');
                    }}
                    disabled={isDeletingAccount}
                    className="w-full px-4 py-2.5 bg-background-subtle border border-border rounded-panel text-sm focus:border-danger-text focus:ring-1 focus:ring-danger-text focus:bg-white outline-none transition-all uppercase placeholder:normal-case font-mono font-bold"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-border flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isDeletingAccount}
                  className="px-5 py-2.5 text-text-secondary font-bold hover:bg-border rounded-button text-sm transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isDeletingAccount || (!deletePassword.trim() && deleteConfirmationText.trim().toUpperCase() !== 'SUPPRIMER')}
                  className="px-6 py-2.5 bg-danger-text text-white font-bold rounded-button shadow-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm transition-all"
                >
                  {isDeletingAccount ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Suppression en cours...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Supprimer définitivement
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
