import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import PwaInstaller from '@/components/pwa-installer';
import { app, analytics } from '@/lib/firebase'; // Import Firebase

export const metadata: Metadata = {
  title: 'OxyTrack',
  description: 'Application pour le suivi de la production d\'oxygène.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#3066BE',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
        <PwaInstaller />
      </body>
    </html>
  );
}
