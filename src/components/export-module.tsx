
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Package, Clock, Gauge, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getMonth, getYear, format, eachMonthOfInterval, startOfYear, endOfYear, parse, isSameMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useData } from '@/components/data-sync-provider';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { jsPDF as jsPDFType } from 'jspdf';
import { formatDate } from '@/lib/utils';
import type { ProductionEntry, SaleEntry } from '@/types';
import { useSettings } from '@/hooks/use-settings';
import { Logo } from '@/components/logo';

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
        const pageHeight = doc.internal.pageSize.getHeight();
        let finalY = 0;

        // --- PDF Header ---
        doc.setFillColor(248, 250, 252); // Light gray background from template
        doc.rect(0, 0, doc.internal.pageSize.getWidth(), 25, 'F');
        
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(45, 55, 72); // Dark text color
        doc.text("Rapport Mensuel d'Activité", 14, 18);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139); // Gray
        doc.text(`${settings.companyName} - ${monthName}`, doc.internal.pageSize.getWidth() - 14, 18, { align: 'right' });
        doc.setLineWidth(0.5);
        doc.setDrawColor(226, 232, 240); // Lighter gray for line
        doc.line(0, 25, doc.internal.pageSize.getWidth(), 25);
        
        finalY = 40;


        // --- Summary Stats ---
        const totalBottlesProduced = productionsInMonth.reduce((acc, entry) => acc + (entry.bottlesProduced || 0) + (entry.otherClientBottlesCount || 0), 0);
        const totalProductionMillis = productionsInMonth.reduce((acc, entry) => {
             if (entry.startTime && entry.endTime) {
                return acc + (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime());
             }
             return acc;
        }, 0);
        const totalProductionHours = Math.floor(totalProductionMillis / (1000 * 60 * 60));
        const productionsWithPressure = productionsInMonth.filter(p => p.pressure && p.pressure > 0);
        const averagePressure = productionsWithPressure.length > 0 ? productionsWithPressure.reduce((acc, p) => acc + (p.pressure || 0), 0) / productionsWithPressure.length : 0;
        const totalBottlesSold = salesInMonth.reduce((acc, s) => acc + s.ourBottlesCount, 0);
        
        const summaryStats = [
            { title: "Bouteilles produites", value: totalBottlesProduced.toString(), color: [5, 150, 105] },
            { title: "Heures de production", value: `${totalProductionHours}h`, color: [37, 99, 235] },
            { title: "Pression moyenne", value: `${averagePressure.toFixed(1)} bar`, color: [217, 70, 239] },
            { title: "Nos bouteilles vendues", value: totalBottlesSold.toString(), color: [249, 115, 22] },
        ];
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(45, 55, 72);
        doc.text("Résumé du mois", 14, finalY);
        finalY += 8;

        const cardWidth = (doc.internal.pageSize.getWidth() - 28 - (3*5)) / 4; // 28 for padding, 3*5 for gaps

        summaryStats.forEach((stat, index) => {
            const x = 14 + (index * (cardWidth + 5));
            doc.setFillColor(248, 250, 252); // Light gray background for cards
            doc.roundedRect(x, finalY, cardWidth, 25, 3, 3, 'F');
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(100, 116, 139);
            doc.text(stat.title, x + 5, finalY + 8);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
            doc.text(stat.value, x + 5, finalY + 18);
        });

        finalY += 35;


        // --- Production Table ---
        if(productionsInMonth.length > 0) {
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(45, 55, 72);
            doc.text("Détails de la Production", 14, finalY);
            finalY += 5;

            doc.autoTable({
                startY: finalY,
                head: [['Date', 'Durée', 'Bouteilles (Total)', 'Pression', 'Source', 'Producteur']],
                body: productionsInMonth.map(p => [
                    formatDate(p.productionDate),
                    p.duration,
                    `${(p.bottlesProduced || 0) + (p.otherClientBottlesCount || 0)}`,
                    p.pressure ? `${p.pressure.toFixed(1)} bar` : '-',
                    p.source.toUpperCase(),
                    p.producer
                ]),
                theme: 'grid',
                headStyles: { fillColor: [48, 102, 190] }, // Primary Blue
                didDrawPage: (data) => { finalY = data.cursor?.y || finalY; }
            });
             finalY = (doc as any).lastAutoTable.finalY + 15;
        }
        
        // --- Sales Table ---
        if(salesInMonth.length > 0) {
            if (finalY + 30 > pageHeight) { // check if new page is needed
                doc.addPage();
                finalY = 20;
            }
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(45, 55, 72);
            doc.text("Détails des Ventes", 14, finalY);
            finalY += 5;

            doc.autoTable({
                startY: finalY,
                head: [['Date', 'Client', `Bouteilles (${settings.companyName})`, 'Bouteilles (Client)', 'Statut']],
                body: salesInMonth.map(s => [
                    formatDate(s.saleDate),
                    s.clientName,
                    s.ourBottlesCount,
                    s.clientBottlesCount || '-',
                    s.status === 'completed' ? 'Récupérée' : 'En attente'
                ]),
                theme: 'grid',
                headStyles: { fillColor: [229, 74, 7] }, // Accent Orange
                didDrawPage: (data) => { finalY = data.cursor?.y || finalY; }
            });
        }

        // --- Footer ---
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Généré par ${settings.companyName} - Page ${i} sur ${pageCount}`, doc.internal.pageSize.getWidth() - 14, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
        }
        
        const fileName = `Rapport - production d'oxygène _${format(monthDate, 'MMMM_yyyy', { locale: fr })}.pdf`;
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
