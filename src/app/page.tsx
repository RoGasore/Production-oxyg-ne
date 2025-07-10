
"use client";

import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductionLog from '@/components/production-log';
import SalesLog from '@/components/sales-log';
import NotificationScheduler from '@/components/notification-scheduler';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import Dashboard from '@/components/dashboard';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-white px-4 shadow-sm sm:px-6">
        <div className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <h1 className="text-xl sm:text-2xl font-semibold font-headline text-primary">OxyTrack</h1>
        </div>
        <div className="ml-auto">
            <Link href="/settings" passHref>
                <Button variant="ghost" size="icon" aria-label="Paramètres">
                    <Settings className="h-5 w-5" />
                </Button>
            </Link>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-full sm:w-auto md:w-[600px]">
            <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
            <TabsTrigger value="production">Production</TabsTrigger>
            <TabsTrigger value="sales">Ventes</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard" className="mt-4">
            <Dashboard />
          </TabsContent>
          <TabsContent value="production" className="mt-4">
            <ProductionLog />
          </TabsContent>
          <TabsContent value="sales" className="mt-4">
            <SalesLog />
          </TabsContent>
        </Tabs>
      </main>
      <NotificationScheduler />
    </div>
  );
}
