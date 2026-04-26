'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2, ChevronLeft } from 'lucide-react';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Veuillez entrer votre adresse email');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      // Simulation d'envoi d'email (le backend n'a pas encore l'endpoint)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSuccess(true);
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] relative overflow-hidden px-4 py-12">
      {/* Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-[#00C896] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-[#00C896] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-[#00C896] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

      <div className="max-w-md w-full relative">
        <div className="glass-emerald rounded-3xl sm:rounded-[2rem] shadow-2xl p-6 sm:p-10">
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-sm font-bold text-[#777777] hover:text-[#00C896] transition-colors mb-6 sm:mb-8 group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Retour à la connexion
          </Link>

          {!isSuccess ? (
            <>
              <div className="text-center mb-8 sm:mb-10">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-[#00C896] rounded-2xl mb-4 sm:mb-6 shadow-lg shadow-[#00C896]/20">
                  <Mail className="text-white w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#1C1C1C] tracking-tight">
                  Mot de passe oublié ?
                </h2>
                <p className="mt-2 sm:mt-3 text-[#777777] font-medium leading-relaxed text-sm sm:text-base">
                  Pas de panique ! Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#777777] group-focus-within:text-[#00C896] transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full pl-11 pr-4 py-3.5 bg-white/50 border border-gray-200 rounded-2xl text-[#1C1C1C] placeholder:text-[#777777] focus:ring-2 focus:ring-[#00C896]/20 focus:border-[#00C896] focus:bg-white outline-none transition-all"
                    placeholder="Votre adresse email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center items-center gap-2 py-4 px-6 bg-[#00C896] hover:bg-[#00B285] text-white text-base font-bold rounded-2xl shadow-xl shadow-[#00C896]/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Envoyer le lien
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-full mb-8 animate-bounce duration-1000">
                <CheckCircle2 className="text-[#00C896] w-12 h-12" />
              </div>
              <h2 className="text-3xl font-black text-[#1C1C1C] tracking-tight mb-4">
                Email envoyé !
              </h2>
              <p className="text-[#777777] font-medium leading-relaxed mb-10">
                Nous avons envoyé un lien de réinitialisation à <span className="text-[#1C1C1C] font-bold">{email}</span>. 
                Pensez à vérifier vos courriers indésirables.
              </p>
              <Link 
                href="/login"
                className="inline-flex items-center justify-center w-full py-4 px-6 bg-white border-2 border-[#00C896] text-[#00C896] text-base font-bold rounded-2xl hover:bg-emerald-50 transition-all active:scale-[0.98]"
              >
                Retourner à la connexion
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
