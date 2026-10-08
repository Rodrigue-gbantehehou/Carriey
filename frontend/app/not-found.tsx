import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* 404 number */}
        <div className="relative mb-8">
          <p className="text-[150px] font-bold text-gray-100 leading-none select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-brand-cta rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/20 rotate-12">
              <svg className="w-10 h-10 text-white -rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-brand-text mb-3 tracking-tight">
          Page introuvable
        </h1>
        <p className="text-brand-muted mb-8 font-medium">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-8 py-3.5 bg-brand-text text-white font-bold rounded-full hover:bg-black transition-all text-sm"
          >
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-3.5 bg-white text-brand-text border border-gray-200 font-bold rounded-full hover:bg-gray-50 transition-all text-sm"
          >
            Mon tableau de bord
          </Link>
        </div>
      </div>
    </div>
  )
}
