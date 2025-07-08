
"use client";

import { useState, useMemo, useEffect } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { useSettings } from '@/hooks/use-settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { SaleEntry } from '@/types';
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
    const [editingName, setEditingName] = useState<string | null>(null);
    const [newName, setNewName] = useState('');
    const { toast } = useToast();

    const clientNames = useMemo(() => {
        const names = sales.map(s => s.clientName);
        return [...new Set(names)].sort((a, b) => a.localeCompare(b));
    }, [sales]);

    const handleEditClick = (name: string) => {
        setEditingName(name);
        setNewName(name);
    };

    const handleSave = (oldName: string) => {
        if (!newName || newName.trim() === '') {
            toast({ variant: 'destructive', title: "Erreur", description: "Le nom ne peut pas être vide." });
            return;
        }

        if (clientNames.includes(newName) && newName !== oldName) {
            toast({ variant: 'destructive', title: "Erreur", description: "Ce nom de client existe déjà." });
            return;
        }

        const updatedSales = sales.map(s => s.clientName === oldName ? { ...s, clientName: newName.trim() } : s);
        setSales(updatedSales);
        toast({ title: 'Succès', description: `Le client '${oldName}' a été renommé en '${newName.trim()}'.` });
        setEditingName(null);
        setNewName('');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Gestion des Noms de Clients</CardTitle>
                <CardDescription>
                    Modifiez les noms des clients existants. Le changement sera appliqué à toutes les ventes passées.
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
                     {clientNames.length === 0 && <p className="text-sm text-muted-foreground">Aucun client enregistré dans les ventes.</p>}
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
