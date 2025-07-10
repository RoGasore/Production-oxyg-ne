
"use client"

import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

const NotificationScheduler = () => {
  const { toast } = useToast();
  const notifiedForMorning = useRef(false);
  const notifiedForAfternoon = useRef(false);

  useEffect(() => {
    if (!('Notification' in window)) {
      console.log("Ce navigateur ne supporte pas les notifications de bureau.");
      return;
    }

    if (Notification.permission !== 'granted') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log("Permission pour les notifications accordée.");
            } else {
                 toast({
                    variant: "destructive",
                    title: "Notifications refusées",
                    description: "Vous ne recevrez pas de rappels.",
                })
            }
        });
    }

    const checkTime = () => {
      if (Notification.permission !== 'granted') return;

      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const day = now.getDay();
      
      // Reset notification flags at midnight
      if (hours === 0 && minutes === 0) {
          notifiedForMorning.current = false;
          notifiedForAfternoon.current = false;
      }

      // 07:50 notification
      if (hours === 7 && minutes === 50 && !notifiedForMorning.current) {
        new Notification('OxyTrack Rappel', {
          body: "Il est l'heure de démarrer la machine. N'oubliez pas d'enregistrer l'heure de début.",
          icon: '/icon.svg'
        });
        notifiedForMorning.current = true;
      }

      // 15:50 notification
      if (hours === 15 && minutes === 50 && !notifiedForAfternoon.current) {
        new Notification('OxyTrack Rappel', {
          body: "La journée est bientôt finie. N'oubliez pas de compléter la fiche de production.",
          icon: '/icon.svg'
        });
        notifiedForAfternoon.current = true;
      }
    };
    
    // Check every minute
    const intervalId = setInterval(checkTime, 60000);

    // Initial check
    checkTime();

    return () => clearInterval(intervalId);
  }, [toast]);

  return null; // This component does not render anything
};

export default NotificationScheduler;
