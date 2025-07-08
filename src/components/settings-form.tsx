
"use client";

import { useState, useMemo, useEffect } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { useSettings } from '@/hooks/use-settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { SaleEntry, ProductionEntry } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function ClientNameManager() {
    const [sales, setSales] = useLocalStorage<SaleEntry[]>('oxytrack-sales', []);
    const [productions, setProductions] = useLocalStorage<ProductionEntry[]>('oxytrack-entries', []);
    const [editingName, setEditingName] = useState<string | null>(null);
    const [newName, setNewName] = useState('');
    const { toast } = useToast();

    const clientNames = useMemo(() => {
        const salesNames = sales.map(s => s.clientName);
        const productionNames = productions
            .filter(p => p.otherClientName)
            .map(p => p.otherClientName as string);
        const allNames = [...salesNames, ...productionNames];
        return [...new Set(allNames)].sort((a, b) => a.localeCompare(b));
    }, [sales, productions]);

    const handleEditClick = (name: string) => {
        setEditingName(name);
        setNewName(name);
    };

    const handleSave = (oldName: string) => {
        const trimmedNewName = newName.trim();
        if (!trimmedNewName) {
            toast({ variant: 'destructive', title: "Erreur", description: "Le nom ne peut pas être vide." });
            return;
        }

        if (clientNames.includes(trimmedNewName) && trimmedNewName !== oldName) {
            toast({ variant: 'destructive', title: "Erreur", description: "Ce nom de client existe déjà." });
            return;
        }

        const updatedSales = sales.map(s => s.clientName === oldName ? { ...s, clientName: trimmedNewName } : s);
        setSales(updatedSales);

        const updatedProductions = productions.map(p => p.otherClientName === oldName ? { ...p, otherClientName: trimmedNewName } : p);
        setProductions(updatedProductions);

        toast({ title: 'Succès', description: `Le client '${oldName}' a été renommé en '${trimmedNewName}'.` });
        setEditingName(null);
        setNewName('');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Gestion des Noms de Clients</CardTitle>
                <CardDescription>
                    Modifiez les noms des clients (hôpitaux et entreprises). Le changement sera appliqué à toutes les ventes et fiches de production.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {clientNames.map(name => (
                        <div key={name} className="flex items-center justify-between gap-4 p-2 border rounded-md">
                            {editingName === name ? (
                                <>
                                    <Input value={newName} onChange={(e) => setNewName(e.target.value)} className="flex-grow" />
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={() => handleSave(name)}>Enregistrer</Button>
                                        <Button size="sm" variant="outline" onClick={() => setEditingName(null)}>Annuler</Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <span className="font-medium">{name}</span>
                                    <Button size="sm" variant="ghost" onClick={() => handleEditClick(name)}>Modifier</Button>
                                </>
                            )}
                        </div>
                    ))}
                     {clientNames.length === 0 && <p className="text-sm text-muted-foreground">Aucun client enregistré dans les ventes ou la production.</p>}
                </div>
            </CardContent>
        </Card>
    );
}


export default function SettingsForm() {
    const { settings, updateSettings } = useSettings();
    const [producer, setProducer] = useState(settings.defaultProducer);
    const { toast } = useToast();

    useEffect(() => {
        setProducer(settings.defaultProducer);
    }, [settings.defaultProducer]);

    const handleSaveProducer = () => {
        if (!producer || producer.trim() === '') {
            toast({ variant: 'destructive', title: "Erreur", description: "Le nom du producteur ne peut pas être vide." });
            return;
        }
        updateSettings({ defaultProducer: producer.trim() });
        toast({ title: 'Succès', description: 'Le nom du producteur par défaut a été mis à jour.' });
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Paramètres Généraux</CardTitle>
                    <CardDescription>
                        Ajustez les paramètres par défaut de l'application.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="default-producer">Nom du producteur par défaut</Label>
                        <div className="flex gap-2">
                            <Input 
                                id="default-producer" 
                                value={producer} 
                                onChange={(e) => setProducer(e.target.value)} 
                            />
                            <Button onClick={handleSaveProducer}>Enregistrer</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <ClientNameManager />
        </div>
    );
}
