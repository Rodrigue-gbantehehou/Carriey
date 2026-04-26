import { Suspense } from 'react';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export const metadata = {
  title: 'Mot de passe oublié - CVtor',
  description: 'Réinitialisez votre mot de passe pour accéder à votre compte CVtor',
};

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]"><div className="animate-pulse text-[#00C896] font-bold">Chargement...</div></div>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
