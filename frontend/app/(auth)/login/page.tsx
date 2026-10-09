import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Connexion - carriey',
  description: 'Connectez-vous à votre compte carriey pour accéder à votre profil master',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-pulse text-text-muted">Chargement...</div></div>}>
      <LoginForm />
    </Suspense>
  );
}
