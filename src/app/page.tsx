
"use client";

import { useState } from 'react';
import type { ProductionEntry } from '@/types';
import { Logo } from '@/components/logo';
import { ProductionTable } from '@/components/production-table';
import { ProductionDialog } from '@/components/production-dialog';
import NotificationScheduler from '@/components/notification-scheduler';
import { formatDuration } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function Home() {
  const [entries, setEntries] = useState<ProductionEntry[]>([]);
  const [dialogState, setDialogState] = useState<{mode: 'create' | 'complete' | null, entry?: ProductionEntry}>({ mode: null });
  const { toast } = useToast();

  const addEntry = (data: Omit<ProductionEntry, 'id' | 'status' | 'endTime' | 'duration' | 'bottlesProduced' | 'observations'>) => {
    const newEntry: ProductionEntry = {
      ...data,
      id: Date.now().toString(),
      endTime: null,
      duration: 'En cours',
      bottlesProduced: 0,
      observations: '',
      status: 'en-cours',
    };
    setEntries(prevEntries => [newEntry, ...prevEntries].sort((a, b) => b.productionDate.getTime() - a.productionDate.getTime()));
  };
  
  const updateEntry = (id: string, data: Pick<ProductionEntry, 'endTime' | 'bottlesProduced' | 'observations'>) => {
    setEntries(prevEntries =>
      prevEntries.map(entry => {
        if (entry.id === id && data.endTime) {
          const durationMs = data.endTime.getTime() - entry.startTime.getTime();
          return {
            ...entry,
            ...data,
            status: 'terminee',
            duration: formatDuration(durationMs),
          };
        }
        return entry;
      })
    );
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
        <ProductionTable entries={entries} onCompleteClick={(entry) => setDialogState({ mode: 'complete', entry })} />
      </main>
      <ProductionDialog
        mode={dialogState.mode}
        entry={dialogState.entry}
        onAddEntry={addEntry}
        onUpdateEntry={updateEntry}
        onOpenChange={(isOpen) => !isOpen && setDialogState({ mode: null })}
      />
      <NotificationScheduler />
    </div>
  );
}
