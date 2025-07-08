
"use client"

import type { ProductionEntry } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatTime, formatDate } from '@/lib/utils';

interface ProductionTableProps {
  entries: ProductionEntry[];
  onUpdateClick: (entry: ProductionEntry) => void;
}

export function ProductionTable({ entries, onUpdateClick }: ProductionTableProps) {
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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Début Usine</TableHead>
                <TableHead>Début Booster</TableHead>
                <TableHead>Fin</TableHead>
                <TableHead>Durée</TableHead>
                <TableHead>Bouteilles</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Producteur</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{formatDate(entry.productionDate)}</TableCell>
                  <TableCell>{formatTime(entry.startTime)}</TableCell>
                  <TableCell>{formatTime(entry.boosterTime)}</TableCell>
                  <TableCell>{formatTime(entry.endTime)}</TableCell>
                  <TableCell>{entry.duration}</TableCell>
                  <TableCell>{entry.status === 'terminee' ? entry.bottlesProduced : '-'}</TableCell>
                  <TableCell>{entry.source.toUpperCase()}</TableCell>
                  <TableCell>{entry.producer}</TableCell>
                  <TableCell>
                    <Badge variant={entry.status === 'terminee' ? 'default' : 'secondary'}>
                      {entry.status === 'terminee' ? 'Terminée' : 'En cours'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {entry.status === 'en-cours' && (
                      <Button variant="outline" size="sm" onClick={() => onUpdateClick(entry)}>Compléter</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
