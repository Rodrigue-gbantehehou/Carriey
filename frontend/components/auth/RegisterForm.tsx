'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import config from '@/lib/config';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // 1. Register via API
      const res = await fetch(`${config.apiBaseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: 'Utilisateur' }) 
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Erreur inscription');
      }

      // 2. Auto login
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        router.push(`/login?callbackUrl=${callbackUrl}`);
      } else {
        router.push(callbackUrl);
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'inscription.');
      console.error('Registration error:', err);
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
        <div className="glass-emerald rounded-[2rem] shadow-2xl p-8 sm:p-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00C896] rounded-2xl mb-6 shadow-lg shadow-[#00C896]/20">
              <User className="text-white w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-[#1C1C1C] tracking-tight">
              Créer un compte
            </h2>
            <p className="mt-3 text-[#777777] font-medium">
              Rejoignez-nous pour créer votre CV
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
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
                autoComplete="new-password"
                required
                className="block w-full pl-11 pr-4 py-3.5 bg-white/50 border border-gray-200 rounded-2xl text-[#1C1C1C] placeholder:text-[#777777] focus:ring-2 focus:ring-[#00C896]/20 focus:border-[#00C896] focus:bg-white outline-none transition-all"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#777777] group-focus-within:text-[#00C896] transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="block w-full pl-11 pr-4 py-3.5 bg-white/50 border border-gray-200 rounded-2xl text-[#1C1C1C] placeholder:text-[#777777] focus:ring-2 focus:ring-[#00C896]/20 focus:border-[#00C896] focus:bg-white outline-none transition-all"
                placeholder="Confirmer le mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center items-center gap-2 py-4 px-6 bg-[#00C896] hover:bg-[#00B285] text-white text-base font-bold rounded-2xl shadow-xl shadow-[#00C896]/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    S&apos;inscrire
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-10 text-center">
            <p className="text-[#777777] font-medium">
              Déjà un compte ?{' '}
              <Link 
                href="/login" 
                className="text-[#00C896] font-bold hover:underline decoration-2 underline-offset-4 transition-all"
              >
                Se connecter
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100 text-center text-xs text-[#777777] leading-relaxed">
            En vous inscrivant, vous acceptez nos{' '}
            <Link href="/terms" className="text-[#00C896] hover:underline font-bold">Conditions</Link>
            {' '}et notre{' '}
            <Link href="/privacy" className="text-[#00C896] hover:underline font-bold">Confidentialité</Link>.
          </div>
        </div>
      </div>
    </div>
  );
}
