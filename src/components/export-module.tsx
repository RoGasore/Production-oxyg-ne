
"use client";

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getMonth, getYear, format, eachMonthOfInterval, startOfYear, endOfYear } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useData } from '@/components/data-sync-provider';

export default function ExportModule() {
    const { productionEntries, saleEntries } = useData();
    const { toast } = useToast();
    const currentMonthKey = `${getYear(new Date())}-${getMonth(new Date())}`;
    const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthKey);

    const availableMonths = () => {
        const allDates = [...productionEntries.map(p => p.productionDate), ...saleEntries.map(s => s.saleDate)];
        if (allDates.length === 0) return [{ label: format(new Date(), 'MMMM yyyy', { locale: fr }), value: currentMonthKey }];

        const minDate = new Date(Math.min(...allDates.map(d => new Date(d).getTime())));
        const maxDate = new Date();
        
        return eachMonthOfInterval({
            start: startOfYear(minDate),
            end: endOfYear(maxDate)
        }).map(date => ({
            label: format(date, 'MMMM yyyy', { locale: fr }),
            value: `${getYear(date)}-${getMonth(date)}`
        })).reverse();
    };

    const handleExport = async () => {
        toast({
            title: "Exportation en cours...",
            description: "Veuillez patienter pendant que nous générons votre rapport PDF."
        });

        // Simulate PDF generation
        setTimeout(() => {
             toast({
                variant: "destructive",
                title: "Fonctionnalité non implémentée",
                description: "La génération de PDF n'est pas encore disponible.",
            });
        }, 2000);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Exportation des Rapports</CardTitle>
                <CardDescription>
                    Générez un rapport PDF mensuel de vos activités de production et de vente.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-auto flex-grow">
                     <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un mois" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableMonths().map(month => (
                                <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleExport} className="w-full sm:w-auto">
                    <Download className="mr-2 h-4 w-4" />
                    Exporter en PDF
                </Button>
            </CardContent>
        </Card>
    );
}
