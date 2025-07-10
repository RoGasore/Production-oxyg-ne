
"use client";

import { useState, useMemo } from 'react';
import type { ProductionEntry } from '@/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { getMonth, getYear, format, eachMonthOfInterval, startOfYear, endOfYear, isSameMonth, getDate, parse } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useData } from '@/components/data-sync-provider';
import { Label } from '@/components/ui/label';

type Metric = 'bottles' | 'hours' | 'pressure';

export default function StatisticsPage() {
    const { productionEntries } = useData();
    const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
    const [metric, setMetric] = useState<Metric>('bottles');

    const availableMonths = useMemo(() => {
        if (productionEntries.length === 0) return [{ label: format(new Date(), 'MMMM yyyy', { locale: fr }), value: format(new Date(), 'yyyy-MM') }];

        const allDates = productionEntries.map(p => new Date(p.productionDate));
        const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
        const maxDate = new Date();
        
        return eachMonthOfInterval({
            start: startOfYear(minDate),
            end: endOfYear(maxDate)
        }).map(date => ({
            label: format(date, 'MMMM yyyy', { locale: fr }),
            value: format(date, 'yyyy-MM')
        })).reverse();
    }, [productionEntries]);

    const chartData = useMemo(() => {
        const monthDate = parse(selectedMonth, 'yyyy-MM', new Date());
        
        const productionsInMonth = productionEntries.filter(p => 
            p.status === 'terminee' && isSameMonth(new Date(p.productionDate), monthDate)
        );

        const dailyData: { [key: number]: { bottles: number, hours: number, pressureSum: number, pressureCount: number } } = {};

        productionsInMonth.forEach(entry => {
            const day = getDate(new Date(entry.productionDate));
            if (!dailyData[day]) {
                dailyData[day] = { bottles: 0, hours: 0, pressureSum: 0, pressureCount: 0 };
            }
            dailyData[day].bottles += (entry.bottlesProduced || 0) + (entry.otherClientBottlesCount || 0);
            
            if (entry.startTime && entry.endTime) {
                const durationMillis = new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime();
                dailyData[day].hours += durationMillis / (1000 * 60 * 60);
            }
            if (entry.pressure) {
                dailyData[day].pressureSum += entry.pressure;
                dailyData[day].pressureCount += 1;
            }
        });

        return Object.entries(dailyData).map(([day, data]) => ({
            name: day,
            Bouteilles: data.bottles,
            Heures: parseFloat(data.hours.toFixed(2)),
            Pression: data.pressureCount > 0 ? parseFloat((data.pressureSum / data.pressureCount).toFixed(1)) : 0,
        })).sort((a,b) => parseInt(a.name) - parseInt(b.name));

    }, [productionEntries, selectedMonth]);

    const chartConfig = {
        Bouteilles: { label: "Bouteilles (unités)", color: "hsl(var(--chart-1))" },
        Heures: { label: "Heures (h)", color: "hsl(var(--chart-2))" },
        Pression: { label: "Pression (bar)", color: "hsl(var(--chart-4))" },
    };

    const currentMetricLabel = chartConfig[metric === 'bottles' ? 'Bouteilles' : metric === 'hours' ? 'Heures' : 'Pression'].label;
    const currentMetricKey = metric === 'bottles' ? 'Bouteilles' : metric === 'hours' ? 'Heures' : 'Pression';
    const currentMetricColor = chartConfig[metric === 'bottles' ? 'Bouteilles' : metric === 'hours' ? 'Heures' : 'Pression'].color;

    return (
        <Card>
            <CardHeader>
                <div className="space-y-1.5 text-center">
                    <CardTitle>Analyse de la Production</CardTitle>
                    <CardDescription>
                        Sélectionnez un mois et une métrique pour visualiser les données de production détaillées.
                    </CardDescription>
                </div>
                <div className="flex justify-center pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 items-end gap-4 w-full max-w-md">
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="month-select" className="text-left">Mois</Label>
                            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                <SelectTrigger id="month-select">
                                    <SelectValue placeholder="Sélectionnez un mois" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableMonths.map(month => (
                                        <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="metric-select" className="text-left">Métrique</Label>
                            <Select value={metric} onValueChange={(val) => setMetric(val as Metric)}>
                                <SelectTrigger id="metric-select">
                                    <SelectValue placeholder="Sélectionnez une métrique" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="bottles">Nombre de bouteilles</SelectItem>
                                    <SelectItem value="hours">Heures de production</SelectItem>
                                    <SelectItem value="pressure">Pression moyenne</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pl-2">
                 <ChartContainer config={chartConfig} className="min-h-[350px] w-full">
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={chartData} margin={{ top: 20, right: 10, bottom: 20, left: -20 }}>
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} label={{ value: "Jour du mois", position: "insideBottom", offset: -10 }} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} label={{ value: currentMetricLabel, angle: -90, position: 'insideLeft', offset: 10 }}/>
                            <Tooltip content={<ChartTooltipContent />} />
                            <Bar dataKey={currentMetricKey} name={currentMetricLabel} fill={currentMetricColor} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
