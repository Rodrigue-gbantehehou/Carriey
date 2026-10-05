'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, Eye, EyeOff, ArrowRight, ArrowLeft, Check, Mail, Lock } from 'lucide-react';
import config from '@/lib/config';

const STEPS = [
  { id: 1, label: 'Email', icon: Mail },
  { id: 2, label: 'Mot de passe', icon: Lock },
];

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8 caractères minimum', pass: password.length >= 8 },
    { label: 'Une lettre majuscule', pass: /[A-Z]/.test(password) },
    { label: 'Un chiffre', pass: /\d/.test(password) },
  ];
  const score = checks.filter(c => c.pass).length;
  const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'];
  const labels = ['', 'Faible', 'Moyen', 'Fort'];

  if (!password) return null;

  return (
    <div className="mt-3 space-y-2">
      {/* Barre de force */}
      <div className="flex gap-1">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? colors[score] : 'bg-gray-200'
            }`}
          />
        ))}
        {score > 0 && (
          <span className={`text-xs font-medium ml-1 ${
            score === 3 ? 'text-green-600' : score === 2 ? 'text-yellow-600' : 'text-red-500'
          }`}>
            {labels[score]}
          </span>
        )}
      </div>
      {/* Critères */}
      <div className="space-y-1">
        {checks.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
              c.pass ? 'bg-green-500' : 'bg-gray-200'
            }`}>
              {c.pass && <Check className="w-2 h-2 text-white stroke-[3]" />}
            </div>
            <span className={`text-xs transition-colors ${c.pass ? 'text-green-700' : 'text-gray-400'}`}>
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RegisterForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [animating, setAnimating] = useState(false);
  const router = useRouter();
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

  const validateStep2 = () => {
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return false;
    }
    if (!/\d/.test(password)) {
      setError('Le mot de passe doit contenir au moins un chiffre.');
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setError('Le mot de passe doit contenir au moins une lettre majuscule.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) goToStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    try {
      setIsLoading(true);
      setError('');

      const res = await fetch(`${config.apiBaseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: 'Utilisateur' }),
      });

      if (!res.ok) {
        let errorData;
        try { errorData = await res.json(); } catch { errorData = { detail: 'Erreur serveur inconnue' }; }
        let errorMessage = 'Erreur lors de l\'inscription';
        if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail.map((err: any) => err.msg).join(', ');
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        }
        throw new Error(errorMessage);
      }

      const result = await signIn('credentials', { redirect: false, email, password });
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
      {/* Left panel */}
      <div className="relative hidden w-0 flex-1 lg:block bg-gray-50 border-r border-gray-100 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-gray-200 p-12 max-w-lg shadow-xl shadow-gray-200/50">
            <Image src={config.appLogo} alt={config.appName} width={64} height={64} className="object-contain mb-6 mx-auto drop-shadow-md" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Gérez votre carrière depuis un seul endroit.</h3>
            <p className="text-gray-500">Centralisez vos expériences, générez des CV sur-mesure et publiez un profil web en un clic.</p>
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
            <h2 className="mt-8 text-2xl font-bold tracking-tight text-gray-900">Créer un compte</h2>
            <p className="mt-2 text-sm text-gray-500">Commencez à centraliser votre parcours en quelques secondes.</p>
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
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
                >
                  Continuer <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 2 — Mot de passe */}
            {currentStep === 2 && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                    Mot de passe
                  </label>
                  <div className="mt-2 relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
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
                  <PasswordStrength password={password} />
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-900">
                    Confirmer le mot de passe
                  </label>
                  <div className="mt-2 relative">
                    <input
                      id="confirm-password"
                      name="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full rounded-md border border-gray-200 bg-white py-2.5 pl-3 pr-10 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none sm:text-sm transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">Les mots de passe ne correspondent pas.</p>
                  )}
                  {confirmPassword && password === confirmPassword && (
                    <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Les mots de passe correspondent.
                    </p>
                  )}
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
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Créer mon compte <Check className="w-4 h-4" /></>}
                  </button>
                </div>
              </form>
            )}
          </div>

          <p className="mt-8 text-center text-sm text-gray-500">
            Déjà un compte ?{' '}
            <Link href="/login" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
