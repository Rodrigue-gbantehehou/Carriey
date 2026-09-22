'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StartPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = () => {
    if (!name.trim()) return;
    setStep(2);
  };

  const handleCreate = () => {
    if (!title.trim()) return;
    setIsLoading(true);

    // Save to localStorage temporarily (before account creation)
    localStorage.setItem('cariey_draft_profile', JSON.stringify({
      full_name: name.trim(),
      title: title.trim(),
      created_at: new Date().toISOString(),
    }));

    // Redirect to profile
    router.push('/profil');
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') action();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Subtle grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#8080800d_1px,transparent_1px),linear-gradient(to_bottom,#8080800d_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Header minimal */}
      <header className="relative z-10 px-6 py-6">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-lg">C</div>
          <span className="text-lg font-bold text-gray-900 tracking-tight">CARIEY</span>
        </Link>
      </header>

      {/* Main */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-20">
        <div className="w-full max-w-md">

          {/* Progress dots */}
          <div className="flex items-center gap-2 mb-10">
            <div className={`h-1.5 rounded-full transition-all duration-500 ${step >= 1 ? 'w-8 bg-indigo-600' : 'w-4 bg-gray-200'}`} />
            <div className={`h-1.5 rounded-full transition-all duration-500 ${step >= 2 ? 'w-8 bg-indigo-600' : 'w-4 bg-gray-200'}`} />
          </div>

          {/* Step 1 : Nom */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <p className="text-sm font-semibold text-indigo-600 mb-2">Étape 1 sur 2</p>
              <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-2">
                Bonjour 👋
              </h1>
              <p className="text-gray-500 mb-8">Comment vous appelez-vous ?</p>

              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    autoFocus
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => handleKeyDown(e, handleStart)}
                    placeholder="Votre nom complet"
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-4 px-5 text-lg text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>

                <button
                  onClick={handleStart}
                  disabled={!name.trim()}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 px-6 text-base font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continuer
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>

              <p className="mt-8 text-center text-sm text-gray-400">
                Vous avez déjà un profil ?{' '}
                <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
                  Retrouvez-le ici
                </Link>
              </p>
            </div>
          )}

          {/* Step 2 : Métier */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <p className="text-sm font-semibold text-indigo-600 mb-2">Étape 2 sur 2</p>
              <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-2">
                Bonjour, {name.split(' ')[0]} !
              </h1>
              <p className="text-gray-500 mb-8">Quel est votre métier ?</p>

              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    autoFocus
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    onKeyDown={e => handleKeyDown(e, handleCreate)}
                    placeholder="Ex : Infirmière, Graphiste, Comptable, Ingénieur…"
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-4 px-5 text-lg text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>

                <button
                  onClick={handleCreate}
                  disabled={!title.trim() || isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 px-6 text-base font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Créer mon profil
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setStep(1)}
                  className="w-full py-3 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ← Retour
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer reassurance */}
      <footer className="relative z-10 py-6 px-6 text-center">
        <p className="text-xs text-gray-400">
          Pas besoin de carte bancaire. Aucun engagement.{' '}
          <span className="text-gray-300">·</span>{' '}
          Vous pouvez sauvegarder votre profil plus tard.
        </p>
      </footer>
    </div>
  );
}
