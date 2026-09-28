'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import config from '@/lib/config';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/accueil';

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

      const registerUrl = `${config.apiBaseUrl}/auth/register`;
      const res = await fetch(registerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: 'Utilisateur' }) 
      });

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch (e) {
          errorData = { detail: "Erreur serveur inconnue" };
        }
        throw new Error(errorData.detail || 'Erreur lors de l\'inscription');
      }

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
      setError(err.message || 'Impossible de contacter le serveur.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side: Image/Pattern */}
      <div className="relative hidden w-0 flex-1 lg:block bg-gray-50 border-r border-gray-100 overflow-hidden">
        {/* Subtle grid pattern for premium tech feel */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-gray-200 p-12 max-w-lg shadow-xl shadow-gray-200/50">
             <Image src={config.appLogo} alt={config.appName} width={64} height={64} className="object-contain mb-6 mx-auto drop-shadow-md" />
             <h3 className="text-2xl font-bold text-gray-900 mb-4">Gérez votre carrière depuis un seul endroit.</h3>
             <p className="text-gray-500">Centralisez vos expériences, générez des CV sur-mesure et publiez un profil web en un clic.</p>
          </div>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image src={config.appLogo} alt={config.appName} width={32} height={32} className="object-contain" priority />
              <span className="text-2xl font-bold text-black-600">{config.appName}</span>
            </Link>
            <h2 className="mt-8 text-2xl font-bold tracking-tight text-gray-900">
              Créer un compte
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Commencez à centraliser votre parcours en quelques secondes.
            </p>
          </div>

          <div className="mt-8">
            {error && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                  Adresse email
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-md border border-gray-200 bg-white py-2.5 px-3 text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none sm:text-sm sm:leading-6 transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                  Mot de passe
                </label>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-md border border-gray-200 bg-white py-2.5 px-3 text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none sm:text-sm sm:leading-6 transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-900">
                  Confirmer le mot de passe
                </label>
                <div className="mt-2">
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full rounded-md border border-gray-200 bg-white py-2.5 px-3 text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none sm:text-sm sm:leading-6 transition-all"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'S\'inscrire'}
                </button>
              </div>
            </form>

            <p className="mt-8 text-center text-sm text-gray-500">
              Déjà un compte ?{' '}
              <Link href="/login" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
