
"use client";

import { useState } from 'react';
import type { ProductionEntry } from '@/types';
import { Logo } from '@/components/logo';
import { ProductionDialog } from '@/components/production-dialog';
import { ProductionTable } from '@/components/production-table';
import NotificationScheduler from '@/components/notification-scheduler';

export default function Home() {
  const [entries, setEntries] = useState<ProductionEntry[]>([]);

  const addEntry = (entry: Omit<ProductionEntry, 'id'>) => {
    setEntries(prevEntries => [...prevEntries, { ...entry, id: Date.now().toString() }].sort((a, b) => b.productionDate.getTime() - a.productionDate.getTime()));
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
            <ProductionDialog onAddEntry={addEntry} />
        </div>
        <ProductionTable entries={entries} />
      </main>
      <NotificationScheduler />
    </div>
  );
}
