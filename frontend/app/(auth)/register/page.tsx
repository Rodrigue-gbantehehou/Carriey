import { Suspense } from 'react';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Inscription - carriey',
  description: 'Créez votre compte carriey pour commencer à centraliser votre parcours',
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-pulse text-text-muted">Chargement...</div></div>}>
      <RegisterForm />
    </Suspense>
  );
}
