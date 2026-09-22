'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function SavePage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    setError('');

    try {
      // TODO: connect to backend magic link endpoint
      await new Promise(r => setTimeout(r, 1200)); // simulate
      setSent(true);
    } catch {
      setError('Une erreur est survenue. Réessayez.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#8080800d_1px,transparent_1px),linear-gradient(to_bottom,#8080800d_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-6 py-6">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-lg">C</div>
          <span className="text-lg font-bold text-gray-900 tracking-tight">CARIEY</span>
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-20">
        <div className="w-full max-w-sm">
          {!sent ? (
            <>
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">Sauvegardez votre profil</h1>
              <p className="text-gray-500 text-sm mb-8">
                Entrez votre email pour recevoir un lien qui vous permettra de retrouver votre profil depuis n'importe quel appareil.
                <br /><span className="font-medium text-gray-700">Pas besoin de mot de passe.</span>
              </p>

              {/* Social auth (future) */}
              <div className="space-y-3 mb-6">
                <button
                  disabled
                  className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium text-gray-400 cursor-not-allowed bg-gray-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Continuer avec Google <span className="text-xs">(bientôt)</span>
                </button>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
                <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">ou par email</span></div>
              </div>

              {error && (
                <div className="mb-4 rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
              )}

              <form onSubmit={handleMagicLink} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Votre email</label>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 px-4 text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 px-6 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-40"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Recevoir mon lien de connexion'}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-gray-400">
                En continuant, vous acceptez nos{' '}
                <Link href="#" className="underline hover:text-gray-600">conditions d'utilisation</Link>.
              </p>
            </>
          ) : (
            // Success state
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Vérifiez votre boîte mail</h2>
              <p className="text-gray-500 text-sm mb-2">
                Nous avons envoyé un lien à <strong className="text-gray-900">{email}</strong>.
              </p>
              <p className="text-gray-400 text-xs mb-8">
                Cliquez sur le lien pour retrouver votre profil CARIEY. Pas besoin de mot de passe.
              </p>
              <button
                onClick={() => setSent(false)}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Utiliser un autre email
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
