
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import StatisticsPage from '@/components/statistics-page';

export default function Stats() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-white px-4 shadow-sm md:px-6">
            <Link href="/" passHref>
                <Button variant="outline" size="icon" aria-label="Retour">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            </Link>
            <h1 className="text-xl font-semibold">Statistiques Détaillées</h1>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <StatisticsPage />
        </main>
    </div>
  );
}
