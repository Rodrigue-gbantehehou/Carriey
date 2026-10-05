'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, Eye, EyeOff, ArrowRight, ArrowLeft, Mail, Lock } from 'lucide-react';
import config from '@/lib/config';

const STEPS = [
  { id: 1, label: 'Email', icon: Mail },
  { id: 2, label: 'Mot de passe', icon: Lock },
];

export default function LoginForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [animating, setAnimating] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/accueil';

  const goToStep = (next: number) => {
    setError('');
    setAnimating(true);
    setTimeout(() => {
      setCurrentStep(next);
      setAnimating(false);
    }, 200);
  };

  const validateStep1 = () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Veuillez saisir une adresse email valide.');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) goToStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Veuillez saisir votre mot de passe.');
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
        setError('Email ou mot de passe incorrect.');
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
      {/* Left panel */}
      <div className="relative hidden w-0 flex-1 lg:block bg-gray-50 border-r border-gray-100 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-gray-200 p-12 max-w-lg shadow-xl shadow-gray-200/50">
            <Image src={config.appLogo} alt={config.appName} width={64} height={64} className="object-contain mb-6 mx-auto drop-shadow-md" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Bon retour parmi nous !</h3>
            <p className="text-gray-500">Retrouvez vos CV, lettres et profil web en quelques secondes.</p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">

          {/* Logo */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image src={config.appLogo} alt={config.appName} width={32} height={32} className="object-contain" priority />
              <span className="text-2xl font-bold text-black-600">{config.appName}</span>
            </Link>
            <h2 className="mt-8 text-2xl font-bold tracking-tight text-gray-900">Se connecter</h2>
            <p className="mt-2 text-sm text-gray-500">Accédez à votre espace carriey.</p>
          </div>



          {/* Error */}
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          {/* Steps */}
          <div className={`transition-all duration-200 ${animating ? 'opacity-0 translate-x-2' : 'opacity-100 translate-x-0'}`}>

            {/* STEP 1 — Email */}
            {currentStep === 1 && (
              <div className="space-y-6">
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
                      autoFocus
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                      placeholder="vous@exemple.com"
                      className="block w-full rounded-md border border-gray-200 bg-white py-2.5 px-3 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none sm:text-sm transition-all"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
                >
                  Continuer <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 2 — Mot de passe */}
            {currentStep === 2 && (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email recap */}
                <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700 truncate">{email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    className="text-xs text-indigo-600 hover:text-indigo-500 font-medium ml-2 flex-shrink-0"
                  >
                    Modifier
                  </button>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                      Mot de passe
                    </label>
                    <Link href="/forgot-password" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500">
                      Mot de passe oublié ?
                    </Link>
                  </div>
                  <div className="mt-2 relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      autoFocus
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full rounded-md border border-gray-200 bg-white py-2.5 pl-3 pr-10 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none sm:text-sm transition-all"
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

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    className="flex items-center gap-1.5 rounded-md border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Retour
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Se connecter <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </div>
              </form>
            )}
          </div>

          <p className="mt-8 text-center text-sm text-gray-500">
            Pas encore de compte ?{' '}
            <Link href="/register" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
