
"use client";

import { useMemo } from 'react';
import Link from 'next/link';
import useLocalStorage from '@/hooks/use-local-storage';
import type { ProductionEntry, SaleEntry } from '@/types';
import StatsCard from '@/components/stats-card';
import { Package, Clock, ShoppingCart, Truck, Gauge, BarChartIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { format, getMonth, getYear, getDate, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import ExportModule from '@/components/export-module';

export default function Dashboard() {
  const [productionEntries] = useLocalStorage<ProductionEntry[]>('oxytrack-entries', []);
  const [saleEntries] = useLocalStorage<SaleEntry[]>('oxytrack-sales', []);

  const stats = useMemo(() => {
    const completedProductions = productionEntries.filter(p => p.status === 'terminee');

    const totalBottlesProduced = completedProductions.reduce((acc, entry) => {
      return acc + (entry.bottlesProduced || 0) + (entry.otherClientBottlesCount || 0);
    }, 0);

    const totalProductionMillis = completedProductions.reduce((acc, entry) => {
        if (entry.startTime && entry.endTime) {
            const duration = new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime();
            return acc + duration;
        }
        return acc;
    }, 0);
    const totalProductionHours = Math.floor(totalProductionMillis / (1000 * 60 * 60));
    
    const productionsWithPressure = completedProductions.filter(p => p.pressure && p.pressure > 0);
    const averagePressure = productionsWithPressure.length > 0 
      ? productionsWithPressure.reduce((acc, entry) => acc + (entry.pressure || 0), 0) / productionsWithPressure.length
      : 0;


    const totalOurBottlesSold = saleEntries.reduce((acc, entry) => {
      return acc + (entry.ourBottlesCount || 0);
    }, 0);
    
    const pendingRecoveries = saleEntries.filter(s => s.status === 'pending').length;

    return {
      totalBottlesProduced,
      totalProductionHours,
      averagePressure,
      totalOurBottlesSold,
      pendingRecoveries,
    };
  }, [productionEntries, saleEntries]);
  
  const productionForCurrentMonth = useMemo(() => {
    const dailyData: { [key: number]: { Hôpital: number; Entreprises: number } } = {};
    const now = new Date();
    const currentMonthInterval = { start: startOfMonth(now), end: endOfMonth(now) };

    const completedProductionsThisMonth = productionEntries.filter(p => 
        p.status === 'terminee' && isWithinInterval(new Date(p.productionDate), currentMonthInterval)
    );

    completedProductionsThisMonth.forEach(entry => {
        const day = getDate(new Date(entry.productionDate));
        if (!dailyData[day]) {
            dailyData[day] = { Hôpital: 0, Entreprises: 0 };
        }
        dailyData[day].Hôpital += entry.bottlesProduced || 0;
        dailyData[day].Entreprises += entry.otherClientBottlesCount || 0;
    });

    return Object.entries(dailyData).map(([day, data]) => ({
        name: day, // Just the day number
        Hôpital: data.Hôpital,
        Entreprises: data.Entreprises,
    })).sort((a,b) => parseInt(a.name) - parseInt(b.name));
  }, [productionEntries]);


  const chartConfig = {
      Hôpital: {
          label: "Hôpital",
          color: "hsl(var(--chart-1))",
      },
      Entreprises: {
          label: "Entreprises",
          color: "hsl(var(--chart-2))",
      },
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatsCard
          title="Bouteilles produites (Total)"
          value={stats.totalBottlesProduced.toString()}
          icon={Package}
          description="Toutes productions terminées"
        />
        <StatsCard
          title="Heures de production"
          value={`${stats.totalProductionHours}h`}
          icon={Clock}
          description="Total des durées de production"
        />
        <StatsCard
          title="Pression Moyenne"
          value={`${stats.averagePressure.toFixed(1)} bar`}
          icon={Gauge}
          description="Moyenne sur productions terminées"
        />
        <StatsCard
          title="Nos bouteilles vendues"
          value={stats.totalOurBottlesSold.toString()}
          icon={ShoppingCart}
          description="Total des bouteilles vendues"
        />
        <StatsCard
          title="Ventes non récupérées"
          value={stats.pendingRecoveries.toString()}
          icon={Truck}
          description="En attente de récupération"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-1">
         <Card>
            <CardHeader>
                <CardTitle>Production de {format(new Date(), 'MMMM yyyy', { locale: fr })}</CardTitle>
                 <CardDescription>
                    Aperçu de la production par jour pour le mois en cours.
                </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={productionForCurrentMonth} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} label={{ value: "Jour du mois", position: "insideBottom", offset: -5 }} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar dataKey="Hôpital" stackId="a" fill="var(--color-Hôpital)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Entreprises" stackId="a" fill="var(--color-Entreprises)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-row-reverse">
                <Button asChild variant="link" className="text-sm">
                    <Link href="/stats">
                        <BarChartIcon className="mr-2 h-4 w-4"/>
                        Voir les statistiques détaillées
                    </Link>
                </Button>
            </CardFooter>
         </Card>
      </div>
      <ExportModule productionEntries={productionEntries} saleEntries={saleEntries} />
    </div>
  );
}
