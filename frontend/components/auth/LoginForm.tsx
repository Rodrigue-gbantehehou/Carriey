'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, ArrowRight, ArrowLeft, Mail, Lock } from 'lucide-react';
import config from '@/lib/config';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

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
    <div className="flex min-h-screen bg-background">
      {/* Left panel */}
      <div className="relative hidden w-0 flex-1 lg:flex bg-primary items-center justify-center p-12 text-center text-white">
        <div className="max-w-lg">
          <Image src={config.appLogo} alt={config.appName} width={64} height={64} className="object-contain mb-6 mx-auto brightness-0 invert" />
          <h2 className="text-ui-2xl font-bold mb-4">Bon retour parmi nous !</h2>
          <p className="text-ui-base text-white/80">Retrouvez vos CV, lettres et profil web en quelques secondes.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image src={config.appLogo} alt={config.appName} width={32} height={32} className="object-contain" priority />
              <span className="text-ui-2xl font-bold text-text-primary">{config.appName}</span>
            </Link>
            <h1 className="mt-8 text-ui-2xl font-bold tracking-tight text-text-primary">Se connecter</h1>
            <p className="mt-2 text-ui-sm text-text-secondary">Accédez à votre espace carriey.</p>
          </div>

          {/* Error */}
          {error && (
            <Alert variant="danger" className="mb-6">
              {error}
            </Alert>
          )}

          {/* Steps */}
          <div className={`transition-all duration-200 ${animating ? 'opacity-0 translate-x-2' : 'opacity-100 translate-x-0'}`}>
            {/* STEP 1 — Email */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <Input
                  label="Adresse email"
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
                />
                <Button fullWidth onClick={handleNext} rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Continuer
                </Button>
              </div>
            )}

            {/* STEP 2 — Mot de passe */}
            {currentStep === 2 && (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email recap */}
                <div className="rounded-panel bg-background-subtle border border-border px-3 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-ui-sm">
                    <Mail className="w-4 h-4 text-text-muted flex-shrink-0" />
                    <span className="text-text-primary truncate">{email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    className="text-ui-xs text-primary hover:text-primary-hover font-medium ml-2 flex-shrink-0"
                  >
                    Modifier
                  </button>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="password" className="block text-ui-sm font-medium text-text-primary">
                      Mot de passe
                    </label>
                    <Link href="/forgot-password" className="text-ui-xs font-semibold text-primary hover:text-primary-hover">
                      Mot de passe oublié ?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      autoFocus
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted hover:text-text-primary"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => goToStep(1)}
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Retour
                  </Button>
                  <Button
                    type="submit"
                    fullWidth
                    isLoading={isLoading}
                    rightIcon={!isLoading ? <ArrowRight className="w-4 h-4" /> : undefined}
                  >
                    Se connecter
                  </Button>
                </div>
              </form>
            )}
          </div>

          <p className="mt-8 text-center text-ui-sm text-text-secondary">
            Pas encore de compte ?{' '}
            <Link href="/register" className="font-semibold text-primary hover:text-primary-hover">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

