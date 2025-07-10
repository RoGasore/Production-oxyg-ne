
"use client";

import { useState, useMemo } from 'react';
import type { SaleEntry } from '@/types';
import { SalesTable } from '@/components/sales-table';
import { SaleDialog } from '@/components/sale-dialog';
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useData } from '@/components/data-sync-provider';
import { db } from '@/lib/firebase';
import { doc, writeBatch } from 'firebase/firestore';


export default function SalesLog() {
  const { saleEntries, setSaleEntries } = useData();
  const [dialogState, setDialogState] = useState<{mode: 'create' | 'update' | null, entry?: SaleEntry}>({ mode: null });
  const [entryToDelete, setEntryToDelete] = useState<SaleEntry | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const { toast } = useToast();

  const addEntry = (data: Omit<SaleEntry, 'id'>) => {
    const newEntry: SaleEntry = { ...data, id: Date.now().toString(), status: 'pending' };
    setSaleEntries(prev => [...prev, newEntry]);
  };
  
  const updateEntry = (id: string, data: Partial<Omit<SaleEntry, 'id'>>) => {
    setSaleEntries(prevEntries =>
      prevEntries.map(entry => entry.id === id ? { ...entry, ...data } : entry)
    );
  };
  
  const toggleSaleStatus = (id: string) => {
    setSaleEntries(prevEntries =>
      prevEntries.map(entry => {
        if (entry.id === id) {
          toast({ title: 'Statut mis à jour', description: 'La vente a été marquée comme récupérée.' });
          return { ...entry, status: 'completed' };
        }
        return entry;
      })
    );
  };

  const deleteEntry = async (id: string) => {
    setSaleEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
    
    const batch = writeBatch(db);
    const docRef = doc(db, 'sales', id);
    batch.delete(docRef);

    try {
        await batch.commit();
        setEntryToDelete(null);
        toast({
            title: "Suppression réussie",
            description: "La vente a été supprimée.",
        });
    } catch(e) {
        console.error("Error deleting document: ", e);
        toast({
            variant: "destructive",
            title: "Erreur",
            description: "La suppression a échoué. Veuillez réessayer.",
        });
        setSaleEntries(saleEntries);
    }
  };

  const filteredEntries = useMemo(() => {
    if (filter === 'all') return saleEntries;
    return saleEntries.filter(entry => entry.status === filter);
  }, [saleEntries, filter]);

  return (
    <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-800">Suivi des ventes</h2>
            <Button size="sm" className="ml-auto gap-1" onClick={() => setDialogState({ mode: 'create' })}>
                <PlusCircle className="h-4 w-4" />
                Nouvelle vente
            </Button>
        </div>
         <Tabs defaultValue="all" onValueChange={(value) => setFilter(value as any)}>
            <TabsList>
                <TabsTrigger value="all">Toutes</TabsTrigger>
                <TabsTrigger value="pending">Non récupérées</TabsTrigger>
                <TabsTrigger value="completed">Récupérées</TabsTrigger>
            </TabsList>
        </Tabs>
        <SalesTable 
            entries={filteredEntries} 
            onUpdateClick={(entry) => setDialogState({ mode: 'update', entry })}
            onDeleteClick={(entry) => setEntryToDelete(entry)}
            onToggleStatus={toggleSaleStatus}
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
