'use client';
import config from '@/lib/config';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

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

      await fetch(`${config.apiBaseUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      // Toujours afficher le succès (pour ne pas révéler si l'email existe)
      setIsSuccess(true);
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
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
            <div className="w-16 h-16 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-2xl mb-6 mx-auto">C</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ne perdez pas le fil.</h3>
            <p className="text-gray-500">Récupérez l'accès à votre Master Profile et retrouvez toutes vos données professionnelles intactes.</p>
          </div>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-black tracking-tighter text-indigo-600">carriey</span>
            </Link>
            {!isSuccess && (
              <>
                <h2 className="mt-8 text-2xl font-bold tracking-tight text-gray-900">
                  Mot de passe oublié
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  Entrez votre email pour recevoir un lien de réinitialisation.
                </p>
              </>
            )}
          </div>

          <div className="mt-8">
            {!isSuccess ? (
              <>
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
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Envoyer le lien'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
                  Vérifiez votre boîte mail
                </h2>
                <p className="text-sm text-gray-500 mb-8">
                  Nous avons envoyé un lien de réinitialisation à <span className="font-semibold text-gray-900">{email}</span>.
                </p>
              </div>
            )}

            <p className="mt-8 text-center text-sm text-gray-500">
              <Link href="/login" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
                &larr; Retour à la connexion
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
