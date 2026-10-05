import './globals.css';
import { Metadata } from 'next';
import { NextAuthProvider } from '@/contexts/NextAuthProvider';
import { Toaster } from 'react-hot-toast';

import siteMetadata from './metadata';
export const metadata: Metadata = siteMetadata;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
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
