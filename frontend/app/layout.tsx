import './globals.css';
import { Inter } from 'next/font/google';
import { Metadata } from 'next';
import { NextAuthProvider } from '@/contexts/NextAuthProvider';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CARIEY - Your professional profile, everywhere.',
  description: 'Votre parcours professionnel, simplement.',
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${inter.className} antialiased bg-gray-50`}>
        <NextAuthProvider>
          <div className="min-h-screen flex flex-col">
            {children}
            <Toaster position="top-right" />
          </div>
        </NextAuthProvider>
      </body>
    </html>
  );
}
