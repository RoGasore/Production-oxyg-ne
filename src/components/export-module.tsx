
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getMonth, getYear, format, eachMonthOfInterval, startOfYear, endOfYear, parse, isSameMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useData } from '@/components/data-sync-provider';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { jsPDF as jsPDFType } from 'jspdf';
import { formatDate, formatDuration } from '@/lib/utils';
import type { ProductionEntry, SaleEntry } from '@/types';
import { useSettings } from '@/hooks/use-settings';

declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
    }
}

export default function ExportModule() {
    const { productionEntries, saleEntries } = useData();
    const { settings } = useSettings();
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
            description: "Génération de votre rapport PDF, veuillez patienter."
        });

        const [year, month] = selectedMonth.split('-').map(Number);
        const monthDate = new Date(year, month);
        const monthName = format(monthDate, 'MMMM yyyy', { locale: fr });
        
        const productionsInMonth = productionEntries.filter(p => isSameMonth(new Date(p.productionDate), monthDate) && p.status === 'terminee');
        const salesInMonth = saleEntries.filter(s => isSameMonth(new Date(s.saleDate), monthDate));

        const doc = new jsPDF();

        // Header
        doc.setFontSize(18);
        doc.text(`Rapport d'Activité - ${settings.companyName}`, 14, 22);
        doc.setFontSize(12);
        doc.text(`Mois: ${monthName}`, 14, 30);
        doc.setLineWidth(0.5);
        doc.line(14, 35, 196, 35);
        
        // Stats
        const completedProductions = productionsInMonth;
        const totalBottlesProduced = completedProductions.reduce((acc, entry) => acc + (entry.bottlesProduced || 0) + (entry.otherClientBottlesCount || 0), 0);
        const totalProductionMillis = completedProductions.reduce((acc, entry) => {
             if (entry.startTime && entry.endTime) {
                return acc + (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime());
             }
             return acc;
        }, 0);
        const totalProductionHours = Math.floor(totalProductionMillis / (1000 * 60 * 60));
        const productionsWithPressure = completedProductions.filter(p => p.pressure && p.pressure > 0);
        const averagePressure = productionsWithPressure.length > 0 ? productionsWithPressure.reduce((acc, p) => acc + (p.pressure || 0), 0) / productionsWithPressure.length : 0;
        const totalBottlesSold = salesInMonth.reduce((acc, s) => acc + s.ourBottlesCount, 0);

        doc.setFontSize(10);
        doc.text(`Bouteilles produites: ${totalBottlesProduced}`, 14, 45);
        doc.text(`Heures de production: ${totalProductionHours}h`, 14, 50);
        doc.text(`Pression moyenne: ${averagePressure.toFixed(1)} bar`, 90, 45);
        doc.text(`Bouteilles vendues: ${totalBottlesSold}`, 90, 50);

        // Production Table
        if(productionsInMonth.length > 0) {
            doc.setFontSize(14);
            doc.text("Détails de la Production", 14, 65);
            doc.autoTable({
                startY: 70,
                head: [['Date', 'Durée', 'Bouteilles', 'Pression', 'Source', 'Producteur']],
                body: productionsInMonth.map(p => [
                    formatDate(p.productionDate),
                    p.duration,
                    `${(p.bottlesProduced || 0) + (p.otherClientBottlesCount || 0)}`,
                    p.pressure ? `${p.pressure} bar` : '-',
                    p.source.toUpperCase(),
                    p.producer
                ]),
                theme: 'grid',
                styles: { fontSize: 8 },
                headStyles: { fillColor: [22, 163, 74] }
            });
        }
        
        // Sales Table
        if(salesInMonth.length > 0) {
            let finalY = (doc as any).lastAutoTable.finalY || 80;
            doc.setFontSize(14);
            doc.text("Détails des Ventes", 14, finalY + 15);
            doc.autoTable({
                startY: finalY + 20,
                head: [['Date', 'Client', 'Réceptionnaire', `Bouteilles (${settings.companyName})`, 'Bouteilles (Client)', 'Statut']],
                body: salesInMonth.map(s => [
                    formatDate(s.saleDate),
                    s.clientName,
                    s.recipientName || '-',
                    s.ourBottlesCount,
                    s.clientBottlesCount || '-',
                    s.status === 'completed' ? 'Récupérée' : 'En attente'
                ]),
                theme: 'grid',
                styles: { fontSize: 8 },
                headStyles: { fillColor: [37, 99, 235] }
            });
        }

        // Footer
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text(`Page ${i} sur ${pageCount}`, 196, 285, { align: 'right' });
        }
        
        const fileName = `Rapport_OxyTrack_${format(monthDate, 'MMMM_yyyy', { locale: fr })}.pdf`;
        doc.save(fileName);
        
        toast({
            title: "Exportation terminée",
            description: `Le fichier ${fileName} a été téléchargé.`
        });
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
