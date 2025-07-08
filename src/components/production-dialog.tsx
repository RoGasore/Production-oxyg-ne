
"use client"

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Clock, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { ProductionEntry } from '@/types';

const createSchema = z.object({
  productionDate: z.date({ required_error: "La date de production est requise." }),
  startTime: z.date({ required_error: "L'heure d'allumage est requise." }),
  boosterTime: z.date({ required_error: "L'heure de début du booster est requise." }),
  source: z.enum(['groupe', 'snel', 'socodee', 'autre']),
  sourceOther: z.string().optional(),
  producer: z.string().min(1, "Le nom du producteur est requis."),
}).refine(data => data.source !== 'autre' || (data.sourceOther && data.sourceOther.length > 0), {
    message: "Veuillez préciser la source 'autre'.",
    path: ["sourceOther"],
});

type CreateFormValues = z.infer<typeof createSchema>;

const completeSchema = z.object({
  endTime: z.date({ required_error: "L'heure de fin est requise." }),
  bottlesProduced: z.coerce.number().min(0, "Le nombre de bouteilles doit être un nombre positif."),
  observations: z.string().min(1, "Les observations sont requises."),
});

type CompleteFormValues = z.infer<typeof completeSchema>;

interface ProductionDialogProps {
  mode: 'create' | 'complete' | null;
  entry?: ProductionEntry;
  onAddEntry: (data: Omit<ProductionEntry, 'id' | 'status' | 'endTime' | 'duration' | 'bottlesProduced' | 'observations'>) => void;
  onUpdateEntry: (id: string, data: Pick<ProductionEntry, 'endTime' | 'bottlesProduced' | 'observations'>) => void;
  onOpenChange: (isOpen: boolean) => void;
}

export function ProductionDialog({ mode, entry, onAddEntry, onUpdateEntry, onOpenChange }: ProductionDialogProps) {
  const { toast } = useToast();

  const createForm = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      productionDate: new Date(),
      source: 'snel',
      producer: 'Rodrigue Gasore',
      sourceOther: '',
    },
  });

  const completeForm = useForm<CompleteFormValues>({
    resolver: zodResolver(completeSchema),
    defaultValues: {
      bottlesProduced: 0,
      observations: 'RAS',
    },
  });

  useEffect(() => {
    if (mode === 'create') {
      createForm.reset({
        productionDate: new Date(),
        source: 'snel',
        producer: 'Rodrigue Gasore',
        sourceOther: '',
        startTime: undefined,
        boosterTime: undefined,
      });
    }
    if (mode === 'complete') {
      completeForm.reset({
        bottlesProduced: 0,
        observations: 'RAS',
        endTime: undefined,
      });
    }
  }, [mode, createForm, completeForm]);

  const sourceValue = createForm.watch('source');
  
  const setCreateTimeToNow = (field: 'startTime' | 'boosterTime') => {
    createForm.setValue(field, new Date(), { shouldValidate: true });
  };
  
  const setCompleteTimeToNow = (field: 'endTime') => {
    completeForm.setValue(field, new Date(), { shouldValidate: true });
  };

  const handleCreateSubmit = (data: CreateFormValues) => {
    const entryData = {
        ...data,
        source: data.source === 'autre' ? data.sourceOther! : data.source,
    };
    onAddEntry(entryData);
    toast({ title: 'Succès', description: 'Nouvelle entrée de production créée.' });
    onOpenChange(false);
  };
  
  const handleCompleteSubmit = (data: CompleteFormValues) => {
    if (!entry) return;
    if (entry.startTime.getTime() >= data.endTime.getTime()) {
      toast({ variant: "destructive", title: "Erreur", description: "L'heure de fin doit être après l'heure de début." });
      return;
    }
    onUpdateEntry(entry.id, data);
    toast({ title: 'Succès', description: 'Fiche de production complétée.' });
    onOpenChange(false);
  };
  
  const isOpen = mode !== null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        {mode === 'create' && (
          <>
            <DialogHeader>
              <DialogTitle>Démarrer une Fiche de Production</DialogTitle>
              <DialogDescription>Remplissez les détails de début de journée.</DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                 <FormField control={createForm.control} name="productionDate" render={({ field }) => (
                    <FormItem className="flex flex-col"><FormLabel>Date de production</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP", { locale: fr }) : <span>Choisissez une date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>
                  )}/>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={createForm.control} name="startTime" render={({ field }) => (
                        <FormItem><FormLabel>Heure d'allumage de l'usine</FormLabel><div className="flex items-center gap-2"><FormControl><Input type="text" value={field.value ? field.value.toLocaleTimeString('fr-FR') : ''} readOnly placeholder="Cliquez sur l'horloge" /></FormControl><Button type="button" variant="outline" size="icon" onClick={() => setCreateTimeToNow('startTime')}><Clock className="h-4 w-4" /></Button></div><FormMessage /></FormItem>
                    )}/>
                    <FormField control={createForm.control} name="boosterTime" render={({ field }) => (
                        <FormItem><FormLabel>Heure de début booster</FormLabel><div className="flex items-center gap-2"><FormControl><Input type="text" value={field.value ? field.value.toLocaleTimeString('fr-FR') : ''} readOnly placeholder="Cliquez sur l'horloge" /></FormControl><Button type="button" variant="outline" size="icon" onClick={() => setCreateTimeToNow('boosterTime')}><Clock className="h-4 w-4" /></Button></div><FormMessage /></FormItem>
                    )}/>
                    <FormField control={createForm.control} name="source" render={({ field }) => (
                        <FormItem><FormLabel>Source d'énergie</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Sélectionnez une source" /></SelectTrigger></FormControl><SelectContent><SelectItem value="groupe">Groupe</SelectItem><SelectItem value="snel">SNEL</SelectItem><SelectItem value="socodee">Socodee</SelectItem><SelectItem value="autre">Autre</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                    )}/>
                    {sourceValue === 'autre' && (
                         <FormField control={createForm.control} name="sourceOther" render={({ field }) => (
                            <FormItem><FormLabel>Précisez la source</FormLabel><FormControl><Input placeholder="Source libre" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    )}
                     <FormField control={createForm.control} name="producer" render={({ field }) => (
                        <FormItem className="md:col-span-2"><FormLabel>Produit par</FormLabel><FormControl><Input placeholder="Nom du producteur" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </div>
                <DialogFooter><Button type="submit">Démarrer la production</Button></DialogFooter>
              </form>
            </Form>
          </>
        )}
        {mode === 'complete' && (
           <>
            <DialogHeader>
              <DialogTitle>Compléter la Fiche de Production</DialogTitle>
              <DialogDescription>Remplissez les informations de fin de journée.</DialogDescription>
            </DialogHeader>
            <Form {...completeForm}>
              <form onSubmit={completeForm.handleSubmit(handleCompleteSubmit)} className="grid gap-4 py-4">
                <FormField control={completeForm.control} name="endTime" render={({ field }) => (
                    <FormItem><FormLabel>Heure de fin</FormLabel><div className="flex items-center gap-2"><FormControl><Input type="text" value={field.value ? field.value.toLocaleTimeString('fr-FR') : ''} readOnly placeholder="Cliquez sur l'horloge" /></FormControl><Button type="button" variant="outline" size="icon" onClick={() => setCompleteTimeToNow('endTime')}><Clock className="h-4 w-4" /></Button></div><FormMessage /></FormItem>
                )}/>
                <FormField control={completeForm.control} name="bottlesProduced" render={({ field }) => (
                    <FormItem><FormLabel>Nombre de bouteilles produites</FormLabel><FormControl><Input type="number" placeholder="ex: 50" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={completeForm.control} name="observations" render={({ field }) => (
                    <FormItem><FormLabel>Observations</FormLabel><FormControl><Textarea placeholder="RAS ou ajoutez une observation..." {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <DialogFooter><Button type="submit">Enregistrer et Terminer</Button></DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
