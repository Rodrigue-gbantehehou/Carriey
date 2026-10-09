import './globals.css';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextAuthProvider } from '@/contexts/NextAuthProvider';
import { Toaster } from 'react-hot-toast';
import LegalConsentWrapper from '@/components/app/layout/LegalConsentWrapper';

import siteMetadata from './metadata';
export const metadata: Metadata = siteMetadata;

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable}`}>
      <body className="font-sans antialiased bg-background text-text-primary">
        <NextAuthProvider>
          <div className="min-h-screen flex flex-col">
            <LegalConsentWrapper>
              {children}
            </LegalConsentWrapper>
            <Toaster position="top-right" />
          </div>
        </NextAuthProvider>
      </body>
    </html>
  );
}
