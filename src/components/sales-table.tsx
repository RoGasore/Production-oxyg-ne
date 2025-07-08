
"use client"

import type { SaleEntry } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSettings } from '@/hooks/use-settings';

interface SalesTableProps {
  entries: SaleEntry[];
  onUpdateClick: (entry: SaleEntry) => void;
  onDeleteClick: (entry: SaleEntry) => void;
  onToggleStatus: (id: string) => void;
}

export function SalesTable({ entries, onUpdateClick, onDeleteClick, onToggleStatus }: SalesTableProps) {
  const { settings } = useSettings();

  if (entries.length === 0) {
    return (
        <Card>
            <CardContent className="flex min-h-[200px] items-center justify-center p-6">
                <div className="text-center">
                    <p className="text-muted-foreground">Aucune vente enregistrée pour ce filtre.</p>
                    <p className="text-sm text-muted-foreground">Cliquez sur 'Nouvelle vente' pour commencer.</p>
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
                <TableHead>Client</TableHead>
                <TableHead>Réceptionnaire</TableHead>
                <TableHead>Bouteilles ({settings.companyName})</TableHead>
                <TableHead>Bouteilles Client</TableHead>
                <TableHead>N° Bouteilles ({settings.companyName})</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{formatDate(entry.saleDate)}</TableCell>
                  <TableCell>
                    <div className="font-medium">{entry.clientName}</div>
                    <div className="text-sm text-muted-foreground">{entry.clientType.charAt(0).toUpperCase() + entry.clientType.slice(1)}</div>
                  </TableCell>
                  <TableCell>{entry.recipientName || '-'}</TableCell>
                  <TableCell>{entry.ourBottlesCount}</TableCell>
                  <TableCell>{entry.clientBottlesCount > 0 ? entry.clientBottlesCount : '-'}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{entry.bottleNumbers || '-'}</TableCell>
                   <TableCell>
                    <Badge variant={entry.status === 'completed' ? 'default' : 'secondary'}>
                      {entry.status === 'completed' ? 'Récupérée' : 'En attente'}
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
                            {entry.status === 'pending' && (
                                <DropdownMenuItem onClick={() => onToggleStatus(entry.id)}>
                                    Marquer comme récupérée
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => onUpdateClick(entry)}>
                                Modifier
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
