"use client";

import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string,
  }>;
  prompt(): Promise<void>;
}

export default function PwaInstaller() {
  const { toast } = useToast();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(registration => {
        console.log('SW registered: ', registration);
      }).catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
        toast({
          variant: "destructive",
          title: "Erreur du Service Worker",
          description: "La fonctionnalité hors ligne ne sera pas disponible.",
        })
      });
    }
  }, [toast]);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      return;
    }
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      toast({
        title: "Installation réussie",
        description: "OxyTrack a été ajouté à votre écran d'accueil.",
      })
    }
    setInstallPrompt(null);
  };

  if (!installPrompt) {
    return null;
  }

  return (
    <Button 
      onClick={handleInstallClick} 
      className="fixed bottom-4 right-4 z-50 shadow-lg"
      aria-label="Installer l'application"
    >
      <Download className="mr-2 h-4 w-4" />
      Installer l'application
    </Button>
  );
}
