
"use client";

import { useState } from 'react';
import type { ProductionEntry } from '@/types';
import { Logo } from '@/components/logo';
import { ProductionTable } from '@/components/production-table';
import { ProductionDialog } from '@/components/production-dialog';
import NotificationScheduler from '@/components/notification-scheduler';
import { formatDuration } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import useLocalStorage from '@/hooks/use-local-storage';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [entries, setEntries] = useLocalStorage<ProductionEntry[]>('oxytrack-entries', []);
  const [dialogState, setDialogState] = useState<{mode: 'create' | 'update' | null, entry?: ProductionEntry}>({ mode: null });
  const [entryToDelete, setEntryToDelete] = useState<ProductionEntry | null>(null);
  const { toast } = useToast();

  const addEntry = (data: Pick<ProductionEntry, 'productionDate' | 'startTime' | 'source' | 'producer'>) => {
    const newEntry: ProductionEntry = {
      ...data,
      id: Date.now().toString(),
      boosterTime: null,
      endTime: null,
      duration: 'En cours',
      bottlesProduced: 0,
      observations: '',
      status: 'en-cours',
    };
    const sortedEntries = [...entries, newEntry].sort((a, b) => new Date(b.productionDate).getTime() - new Date(a.productionDate).getTime());
    setEntries(sortedEntries);
  };
  
  const updateEntry = (id: string, data: Partial<Omit<ProductionEntry, 'id'>>) => {
    setEntries(prevEntries =>
      prevEntries.map(entry => {
        if (entry.id === id) {
          const updatedEntry = { ...entry, ...data };

          if (updatedEntry.endTime && updatedEntry.startTime) {
            const durationMs = new Date(updatedEntry.endTime).getTime() - new Date(updatedEntry.startTime).getTime();
            updatedEntry.duration = formatDuration(durationMs);
            updatedEntry.status = 'terminee';
          }
          return updatedEntry;
        }
        return entry;
      }).sort((a, b) => new Date(b.productionDate).getTime() - new Date(a.productionDate).getTime())
    );
  };

  const deleteEntry = (id: string) => {
    setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
    setEntryToDelete(null);
    toast({
        title: "Suppression réussie",
        description: "La fiche de production a été supprimée.",
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-white px-4 shadow-sm md:px-6">
        <div className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <h1 className="text-2xl font-semibold font-headline text-primary">OxyTrack</h1>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-800">Journal de production</h2>
            <Button size="sm" className="ml-auto gap-1" onClick={() => setDialogState({ mode: 'create' })}>
                <PlusCircle className="h-4 w-4" />
                Nouvelle entrée
            </Button>
        </div>
        <ProductionTable 
            entries={entries} 
            onUpdateClick={(entry) => setDialogState({ mode: 'update', entry })}
            onDeleteClick={(entry) => setEntryToDelete(entry)}
        />
      </main>
      <ProductionDialog
        mode={dialogState.mode}
        entry={dialogState.entry}
        onAddEntry={addEntry}
        onUpdateEntry={updateEntry}
        onOpenChange={(isOpen) => !isOpen && setDialogState({ mode: null })}
      />
      <AlertDialog open={!!entryToDelete} onOpenChange={() => setEntryToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ?</AlertDialogTitle>
                <AlertDialogDescription>
                Cette action est irréversible. La fiche de production sera définitivement supprimée.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setEntryToDelete(null)}>Annuler</AlertDialogCancel>
                <AlertDialogAction 
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => entryToDelete && deleteEntry(entryToDelete.id)}
                >
                Supprimer
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <NotificationScheduler />
    </div>
  );
}
