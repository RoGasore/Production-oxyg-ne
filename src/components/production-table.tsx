
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
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProductionTableProps {
  entries: ProductionEntry[];
  onUpdateClick: (entry: ProductionEntry) => void;
  onDeleteClick: (entry: ProductionEntry) => void;
}

export function ProductionTable({ entries, onUpdateClick, onDeleteClick }: ProductionTableProps) {
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
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Ouvrir le menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onUpdateClick(entry)}>
                                {entry.status === 'en-cours' ? 'Compléter' : 'Modifier'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                onClick={() => onDeleteClick(entry)}
                            >
                                Supprimer
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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
