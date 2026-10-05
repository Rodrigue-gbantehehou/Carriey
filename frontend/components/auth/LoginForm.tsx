'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import config from '@/lib/config';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/accueil';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('Identifiants invalides ou erreur de connexion.');
      } else {
        window.location.href = callbackUrl;
      }
    } catch (err: any) {
      setError('Impossible de contacter le serveur.');
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
              <span className="text-2xl font-black tracking-tighter text-indigo-600">{config.appName}</span>
            </Link>
            <h2 className="mt-8 text-2xl font-bold tracking-tight text-gray-900">
              Connexion
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Content de vous revoir. Veuillez saisir vos identifiants.
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
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                    Mot de passe
                  </label>
                  <div className="text-sm">
                    <Link href="/forgot-password" className="font-semibold text-indigo-600 hover:text-indigo-500">
                      Mot de passe oublié ?
                    </Link>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full rounded-md border border-gray-200 bg-white py-2.5 pl-3 pr-10 text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none sm:text-sm sm:leading-6 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Se connecter'}
                </button>
              </div>
            </form>

            <p className="mt-8 text-center text-sm text-gray-500">
              Pas encore de compte ?{' '}
              <Link href="/register" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
                S'inscrire
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
