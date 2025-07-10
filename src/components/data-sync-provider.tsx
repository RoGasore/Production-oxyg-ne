
"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, writeBatch, doc, getDocs, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { ProductionEntry, SaleEntry } from '@/types';
import type { AppSettings } from '@/hooks/use-settings';
import { useToast } from '@/hooks/use-toast';

// Define the shape of our data context
interface DataContextProps {
  productionEntries: ProductionEntry[];
  setProductionEntries: (value: ProductionEntry[] | ((val: ProductionEntry[]) => ProductionEntry[])) => void;
  saleEntries: SaleEntry[];
  setSaleEntries: (value: SaleEntry[] | ((val: SaleEntry[]) => SaleEntry[])) => void;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  isOnline: boolean;
  isSyncing: boolean;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

// Helper to convert Firestore timestamps to Dates
const convertTimestamps = (data: any) => {
    for (const key in data) {
        if (data[key] instanceof Timestamp) {
            data[key] = data[key].toDate();
        }
    }
    return data;
};

export function DataSyncProvider({ children }: { children: React.ReactNode }) {
    const { toast } = useToast();
    const [isOnline, setIsOnline] = useState(true);
    const [isSyncing, setIsSyncing] = useState(true);

    const [productionEntries, setProductionEntries] = useLocalStorage<ProductionEntry[]>('oxytrack-entries', []);
    const [saleEntries, setSaleEntries] = useLocalStorage<SaleEntry[]>('oxytrack-sales', []);
    const [settings, setSettings] = useLocalStorage<AppSettings>('oxytrack-settings', {
        defaultProducer: 'Rodrigue Gasore',
        companyName: 'OxyTrack',
    });
    
    // Listen to online/offline status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Set initial status
        if (typeof window.navigator.onLine !== 'undefined') {
            setIsOnline(window.navigator.onLine);
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);
    
    // Effect for Firestore subscriptions
    useEffect(() => {
        setIsSyncing(true);
        
        const productionsRef = collection(db, 'productions');
        const salesRef = collection(db, 'sales');
        const settingsRef = collection(db, 'settings');

        const unsubProductions = onSnapshot(productionsRef, (snapshot) => {
            const serverEntries = snapshot.docs.map(doc => convertTimestamps({ ...doc.data(), id: doc.id }) as ProductionEntry);
            setProductionEntries(serverEntries.sort((a, b) => new Date(b.productionDate).getTime() - new Date(a.productionDate).getTime()));
            setIsSyncing(false);
        }, (error) => {
            console.error("Firestore (productions) error:", error);
            toast({ variant: 'destructive', title: "Erreur de synchro", description: "Impossible de charger les données de production."});
            setIsSyncing(false);
        });

        const unsubSales = onSnapshot(salesRef, (snapshot) => {
            const serverEntries = snapshot.docs.map(doc => convertTimestamps({ ...doc.data(), id: doc.id }) as SaleEntry);
            setSaleEntries(serverEntries.sort((a,b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()));
        }, (error) => {
             console.error("Firestore (sales) error:", error);
             toast({ variant: 'destructive', title: "Erreur de synchro", description: "Impossible de charger les données de ventes."});
        });
        
        const unsubSettings = onSnapshot(settingsRef, (snapshot) => {
            if (!snapshot.empty && snapshot.docs[0].data()) {
                const serverSettings = snapshot.docs[0].data() as AppSettings;
                setSettings(prev => ({...prev, ...serverSettings}));
            }
        });

        return () => {
            unsubProductions();
            unsubSales();
            unsubSettings();
        };
    }, [isOnline, setProductionEntries, setSaleEntries, setSettings, toast]);

    const updateSettings = (newSettings: Partial<AppSettings>) => {
        const batch = writeBatch(db);
        const settingsRef = doc(db, 'settings', 'global');
        batch.set(settingsRef, newSettings, { merge: true });
        batch.commit().catch(err => {
            console.error(err);
            toast({ variant: 'destructive', title: "Erreur", description: "Impossible de sauvegarder les paramètres."});
        });
    }

    const value: DataContextProps = {
        productionEntries,
        setProductionEntries: (updater) => {
            const newEntries = typeof updater === 'function' ? updater(productionEntries) : updater;
            setProductionEntries(newEntries);
            const batch = writeBatch(db);
            newEntries.forEach(entry => {
                const docRef = doc(db, 'productions', entry.id);
                batch.set(docRef, entry);
            });
            batch.commit().catch(console.error);
        },
        saleEntries,
        setSaleEntries: (updater) => {
            const newEntries = typeof updater === 'function' ? updater(saleEntries) : updater;
            setSaleEntries(newEntries);
            const batch = writeBatch(db);
            newEntries.forEach(entry => {
                const docRef = doc(db, 'sales', entry.id);
                batch.set(docRef, entry);
            });
            batch.commit().catch(console.error);
        },
        settings,
        updateSettings,
        isOnline,
        isSyncing
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// Custom hook to use the data context
export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataSyncProvider');
    }
    return context;
};
