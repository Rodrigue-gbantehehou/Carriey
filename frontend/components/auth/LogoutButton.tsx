'use client';

import { signOut } from 'next-auth/react';
import { toast } from 'react-hot-toast';

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/login' });
      toast.success('Déconnexion réussie');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
    >
      Déconnexion
    </button>
  );
}
