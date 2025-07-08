
"use client";

import { useState } from 'react';
import type { SaleEntry } from '@/types';
import { SalesTable } from '@/components/sales-table';
import { SaleDialog } from '@/components/sale-dialog';
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

export default function SalesLog() {
  const [entries, setEntries] = useLocalStorage<SaleEntry[]>('oxytrack-sales', []);
  const [dialogState, setDialogState] = useState<{mode: 'create' | 'update' | null, entry?: SaleEntry}>({ mode: null });
  const [entryToDelete, setEntryToDelete] = useState<SaleEntry | null>(null);
  const { toast } = useToast();

  const addEntry = (data: Omit<SaleEntry, 'id'>) => {
    const newEntry: SaleEntry = { ...data, id: Date.now().toString() };
    const sortedEntries = [...entries, newEntry].sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
    setEntries(sortedEntries);
  };
  
  const updateEntry = (id: string, data: Partial<Omit<SaleEntry, 'id'>>) => {
    setEntries(prevEntries =>
      prevEntries.map(entry => entry.id === id ? { ...entry, ...data } : entry)
      .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime())
    );
  };

  const deleteEntry = (id: string) => {
    setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
    setEntryToDelete(null);
    toast({
        title: "Suppression réussie",
        description: "La vente a été supprimée.",
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-800">Suivi des ventes</h2>
            <Button size="sm" className="ml-auto gap-1" onClick={() => setDialogState({ mode: 'create' })}>
                <PlusCircle className="h-4 w-4" />
                Nouvelle vente
            </Button>
        </div>
        <SalesTable 
            entries={entries} 
            onUpdateClick={(entry) => setDialogState({ mode: 'update', entry })}
            onDeleteClick={(entry) => setEntryToDelete(entry)}
        />
      <SaleDialog
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
                Cette action est irréversible. La fiche de vente sera définitivement supprimée.
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
