
"use client"

import type { ProductionEntry } from '@/types';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { formatTime } from '@/lib/utils';

interface ProductionTableProps {
  entries: ProductionEntry[];
}

export function ProductionTable({ entries }: ProductionTableProps) {
  if (entries.length === 0) {
    return (
        <Card>
            <CardContent className="flex min-h-[200px] items-center justify-center p-6">
                <div className="text-center">
                    <p className="text-muted-foreground">Aucune donnée de production enregistrée.</p>
                    <p className="text-sm text-muted-foreground">Cliquez sur 'Nouvelle entrée' pour commencer.</p>
                </div>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Début</TableHead>
              <TableHead>Début Booster</TableHead>
              <TableHead>Fin</TableHead>
              <TableHead>Durée</TableHead>
              <TableHead>Bouteilles</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Producteur</TableHead>
              <TableHead>Observations</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{entry.productionDate.toLocaleDateString('fr-FR')}</TableCell>
                <TableCell>{formatTime(entry.startTime)}</TableCell>
                <TableCell>{formatTime(entry.boosterTime)}</TableCell>
                <TableCell>{formatTime(entry.endTime)}</TableCell>
                <TableCell>{entry.duration}</TableCell>
                <TableCell>{entry.bottlesProduced}</TableCell>
                <TableCell>{entry.source}</TableCell>
                <TableCell>{entry.producer}</TableCell>
                <TableCell className="max-w-[200px] truncate">{entry.observations}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
