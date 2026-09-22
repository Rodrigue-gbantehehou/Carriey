import { Suspense } from 'react';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Inscription - CVtor',
  description: 'Créez votre compte CVtor pour commencer à créer des CV professionnels',
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-pulse text-gray-400">Chargement...</div></div>}>
      <RegisterForm />
    </Suspense>
  );
}
