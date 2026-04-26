'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import config from '@/lib/config';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      console.log("[Login] Starting login for:", email);
      console.log("[Login] API URL:", config.apiBaseUrl);

      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      console.log("[Login] Result:", result);

      if (result?.error) {
        console.error("[Login] Auth error:", result.error);
        setError('Identifiants invalides ou erreur de connexion.');
      } else {
        console.log("[Login] Success! Redirecting...");
        router.push(callbackUrl);
      }
    } catch (err: any) {
      console.error("[Login] Exception:", err);
      setError('Impossible de contacter le serveur. Vérifiez votre connexion.');
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
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-[#00C896] rounded-2xl mb-4 sm:mb-6 shadow-lg shadow-[#00C896]/20">
              <Lock className="text-white w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1C1C1C] tracking-tight">
              Bon retour parmi nous
            </h2>
            <p className="mt-2 sm:mt-3 text-[#777777] font-medium text-sm sm:text-base">
              Connectez-vous pour continuer à créer
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
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
                  placeholder="Adresse email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#777777] group-focus-within:text-[#00C896] transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full pl-11 pr-4 py-3.5 bg-white/50 border border-gray-200 rounded-2xl text-[#1C1C1C] placeholder:text-[#777777] focus:ring-2 focus:ring-[#00C896]/20 focus:border-[#00C896] focus:bg-white outline-none transition-all"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link 
                href="/forgot-password" 
                className="text-sm font-semibold text-[#00C896] hover:text-[#00B285] transition-colors"
              >
                Mot de passe oublié ?
              </Link>
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
                  Se connecter
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-[#777777] font-medium">
              Pas encore de compte ?{' '}
              <Link 
                href="/register" 
                className="text-[#00C896] font-bold hover:underline decoration-2 underline-offset-4 transition-all"
              >
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
