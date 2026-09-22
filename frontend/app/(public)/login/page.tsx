import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Connexion - CVtor',
  description: 'Connectez-vous à votre compte CVtor pour accéder à vos CV',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-pulse text-gray-400">Chargement...</div></div>}>
      <LoginForm />
    </Suspense>
  );
}
