import LoginForm from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Connexion - CVtor',
  description: 'Connectez-vous à votre compte CVtor pour accéder à vos CV',
};

export default function LoginPage() {
  return <LoginForm />;
}
