'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const loading = status === 'loading';
  const user = session?.user;

  useEffect(() => {
    // Ne rien faire pendant le chargement
    if (loading) return;

    // Rediriger si l'utilisateur n'est pas connecté
    if (!user) {
      router.push(redirectTo);
      return;
    }

    // Vérifier les droits d'administrateur si nécessaire
    if (requireAdmin && user.role !== 'super_admin' && user.role !== 'admin') {
      router.push('/unauthorized');
    }
  }, [user, loading, requireAdmin, router, redirectTo]);

  // Afficher un indicateur de chargement pendant la vérification
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Vérifier les droits d'administrateur après le chargement
  if (requireAdmin && user && user.role !== 'super_admin' && user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Accès refusé</h1>
          <p>Vous n'avez pas les droits nécessaires pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  // Afficher le contenu protégé
  return <>{children}</>;
}
