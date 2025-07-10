
"use client";

import { useState } from 'react';
import type { ProductionEntry } from '@/types';
import { ProductionTable } from '@/components/production-table';
import { ProductionDialog } from '@/components/production-dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
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
import { formatDuration } from '@/lib/utils';
import { useData } from '@/components/data-sync-provider';
import { doc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';


export default function ProductionLog() {
  const { productionEntries, setProductionEntries } = useData();
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
      pressure: null,
      observations: '',
      status: 'en-cours',
      bottleDestination: null,
      otherClientName: null,
      otherClientBottlesCount: null,
    };
    setProductionEntries(prev => [...prev, newEntry]);
  };
  
  const updateEntry = (id: string, data: Partial<Omit<ProductionEntry, 'id'>>) => {
    setProductionEntries(prevEntries =>
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
      })
    );
  };

  const deleteEntry = async (id: string) => {
    setProductionEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
    
    const batch = writeBatch(db);
    const docRef = doc(db, 'productions', id);
    batch.delete(docRef);
    
    try {
        await batch.commit();
        setEntryToDelete(null);
        toast({
            title: "Suppression réussie",
            description: "La fiche de production a été supprimée.",
        });
    } catch(e) {
        console.error("Error deleting document: ", e);
        toast({
            variant: "destructive",
            title: "Erreur",
            description: "La suppression a échoué. Veuillez réessayer.",
        });
        // Re-add the entry if deletion fails
        setProductionEntries(productionEntries);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-800">Suivi quotidien</h2>
            <Button size="sm" className="ml-auto gap-1" onClick={() => setDialogState({ mode: 'create' })}>
                <PlusCircle className="h-4 w-4" />
                Nouvelle entrée
            </Button>
        </div>
        <ProductionTable 
            entries={productionEntries} 
            onUpdateClick={(entry) => setDialogState({ mode: 'update', entry })}
            onDeleteClick={(entry) => setEntryToDelete(entry)}
        />
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
    </div>
  );
}
