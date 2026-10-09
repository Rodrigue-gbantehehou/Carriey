'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, ArrowRight, ArrowLeft, Check, Mail, Lock } from 'lucide-react';
import config from '@/lib/config';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8 caractères minimum', pass: password.length >= 8 },
    { label: 'Une lettre majuscule', pass: /[A-Z]/.test(password) },
    { label: 'Un chiffre', pass: /\d/.test(password) },
  ];
  const score = checks.filter(c => c.pass).length;
  const colors = ['bg-danger-text', 'bg-warning-text', 'bg-yellow-400', 'bg-success-text'];
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
              i <= score ? colors[score] : 'bg-background-subtle border border-border'
            }`}
          />
        ))}
        {score > 0 && (
          <span className={`text-ui-xs font-medium ml-1 ${
            score === 3 ? 'text-success-text' : score === 2 ? 'text-warning-text' : 'text-danger-text'
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
              c.pass ? 'bg-success-text' : 'bg-background-subtle border border-border'
            }`}>
              {c.pass && <Check className="w-2 h-2 text-white stroke-[3]" />}
            </div>
            <span className={`text-ui-xs transition-colors ${c.pass ? 'text-success-text' : 'text-text-muted'}`}>
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
  const [acceptTerms, setAcceptTerms] = useState(false);
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
    if (!acceptTerms) {
      setError('Vous devez accepter les conditions générales et la politique de confidentialité.');
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
    <div className="flex min-h-screen bg-background">
      {/* Left panel */}
      <div className="relative hidden w-0 flex-1 lg:flex bg-primary items-center justify-center p-12 text-center text-white">
        <div className="max-w-lg">
          <Image src={config.appLogo} alt={config.appName} width={64} height={64} className="object-contain mb-6 mx-auto brightness-0 invert" />
          <h2 className="text-ui-2xl font-bold mb-4">Gérez votre carrière depuis un seul endroit.</h2>
          <p className="text-ui-base text-white/80">Centralisez vos expériences, générez des CV sur-mesure et publiez un profil web en un clic.</p>
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
            <h1 className="mt-8 text-ui-2xl font-bold tracking-tight text-text-primary">Créer un compte</h1>
            <p className="mt-2 text-ui-sm text-text-secondary">Commencez à centraliser votre parcours en quelques secondes.</p>
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
                  <div className="mb-2">
                    <label htmlFor="password" className="block text-ui-sm font-medium text-text-primary">
                      Mot de passe
                    </label>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
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
                  <PasswordStrength password={password} />
                </div>

                <div>
                  <div className="mb-2">
                    <label htmlFor="confirm-password" className="block text-ui-sm font-medium text-text-primary">
                      Confirmer le mot de passe
                    </label>
                  </div>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      name="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted hover:text-text-primary"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="mt-1 text-ui-xs text-danger-text">Les mots de passe ne correspondent pas.</p>
                  )}
                  {confirmPassword && password === confirmPassword && (
                    <p className="mt-1 text-ui-xs text-success-text flex items-center gap-1">
                      <Check className="w-3 h-3" /> Les mots de passe correspondent.
                    </p>
                  )}
                </div>

                <div className="flex items-start gap-2 pt-2">
                  <input
                    id="accept-terms"
                    name="accept-terms"
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                  />
                  <label htmlFor="accept-terms" className="text-ui-xs text-text-secondary cursor-pointer">
                    J'accepte les <Link href="/legal/cgu" className="text-primary hover:underline">Conditions Générales d'Utilisation</Link> et la <Link href="/legal/privacy" className="text-primary hover:underline">Politique de confidentialité</Link>.
                  </label>
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
                    rightIcon={!isLoading ? <Check className="w-4 h-4" /> : undefined}
                  >
                    Créer mon compte
                  </Button>
                </div>
              </form>
            )}
          </div>

          <p className="mt-8 text-center text-ui-sm text-text-secondary">
            Déjà un compte ?{' '}
            <Link href="/login" className="font-semibold text-primary hover:text-primary-hover">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

