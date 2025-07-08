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
import { cn, formatTime, formatDate } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { ProductionEntry } from '@/types';

const productionSchema = z.object({
  productionDate: z.date({ required_error: "La date de production est requise." }),
  startTime: z.date({ required_error: "L'heure d'allumage est requise." }),
  source: z.string().min(1, "La source d'énergie est requise."),
  sourceOther: z.string().optional(),
  producer: z.string().min(1, "Le nom du producteur est requis."),
  boosterTime: z.date().optional().nullable(),
  endTime: z.date().optional().nullable(),
  bottlesProduced: z.coerce.number().optional().nullable(),
  observations: z.string().optional().nullable(),
}).refine(data => data.source !== 'autre' || (data.sourceOther && data.sourceOther.length > 0), {
    message: "Veuillez préciser la source 'autre'.",
    path: ["sourceOther"],
});

type FormValues = z.infer<typeof productionSchema>;

interface ProductionDialogProps {
  mode: 'create' | 'update' | null;
  entry?: ProductionEntry;
  onAddEntry: (data: Pick<ProductionEntry, 'productionDate' | 'startTime' | 'source' | 'producer'>) => void;
  onUpdateEntry: (id: string, data: Partial<Omit<ProductionEntry, 'id'>>) => void;
  onOpenChange: (isOpen: boolean) => void;
}

const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);


const InfoField = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center gap-2 text-sm">
        <CheckCircleIcon className="h-5 w-5 text-green-600" />
        <div>
            <span className="font-medium text-gray-800">{label}:</span>
            <span className="ml-2 text-gray-600">{value}</span>
        </div>
    </div>
);

export function ProductionDialog({ mode, entry, onAddEntry, onUpdateEntry, onOpenChange }: ProductionDialogProps) {
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(productionSchema),
    defaultValues: {
      productionDate: new Date(),
      source: 'snel',
      producer: 'Rodrigue Gasore',
      observations: 'RAS',
      boosterTime: null,
      endTime: null,
      bottlesProduced: 0
    },
  });

  useEffect(() => {
    if (mode === 'create') {
      form.reset({
        productionDate: new Date(),
        startTime: undefined,
        source: 'snel',
        producer: 'Rodrigue Gasore',
        sourceOther: '',
        boosterTime: null,
        endTime: null,
        bottlesProduced: 0,
        observations: "RAS"
      });
    } else if (mode === 'update' && entry) {
      form.reset({
        ...entry,
        bottlesProduced: entry.bottlesProduced || 0,
        observations: entry.observations || 'RAS',
      });
    }
  }, [mode, entry, form]);

  const sourceValue = form.watch('source');
  
  const setTimeToNow = (field: 'startTime' | 'boosterTime' | 'endTime') => {
    form.setValue(field, new Date(), { shouldValidate: true });
  };

  const handleSubmit = (data: FormValues) => {
    const finalData = {
        ...data,
        source: data.source === 'autre' ? data.sourceOther! : data.source,
    };
    
    if (mode === 'create') {
      const { productionDate, startTime, source, producer } = finalData;
      onAddEntry({ productionDate, startTime, source, producer });
      toast({ title: 'Succès', description: 'Nouvelle entrée de production créée.' });
    } else if (mode === 'update' && entry) {
       if (data.endTime && entry.startTime && data.endTime.getTime() <= entry.startTime.getTime()) {
          toast({ variant: "destructive", title: "Erreur", description: "L'heure de fin doit être après l'heure de début." });
          return;
       }
       if (data.boosterTime && entry.startTime && data.boosterTime.getTime() <= entry.startTime.getTime()) {
           toast({ variant: "destructive", title: "Erreur", description: "L'heure du booster doit être après l'heure d'allumage." });
           return;
       }
       if (data.endTime && data.boosterTime && data.endTime.getTime() <= data.boosterTime.getTime()) {
           toast({ variant: "destructive", title: "Erreur", description: "L'heure de fin doit être après l'heure du booster." });
           return;
       }
      onUpdateEntry(entry.id, finalData);
      toast({ title: 'Succès', description: 'Fiche de production mise à jour.' });
    }
    onOpenChange(false);
  };
  
  const isOpen = mode !== null;
  const isUpdate = mode === 'update';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isUpdate ? 'Mettre à jour la Fiche' : 'Démarrer une Fiche'}</DialogTitle>
          <DialogDescription>{isUpdate ? 'Complétez les informations manquantes.' : 'Remplissez les détails de début de journée.'}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-2">
            
            {/* --- Champs toujours visibles ou remplis --- */}
            {isUpdate && entry ? <InfoField label="Date de production" value={formatDate(entry.productionDate)} /> : <FormField control={form.control} name="productionDate" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Date de production</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP", { locale: fr }) : <span>Choisissez une date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem> )}/>}
            {isUpdate && entry ? <InfoField label="Producteur" value={entry.producer} /> : <FormField control={form.control} name="producer" render={({ field }) => (<FormItem><FormLabel>Produit par</FormLabel><FormControl><Input placeholder="Nom du producteur" {...field} /></FormControl><FormMessage /></FormItem> )}/>}
            {isUpdate && entry ? <InfoField label="Source d'énergie" value={entry.source} /> : <FormField control={form.control} name="source" render={({ field }) => (<FormItem><FormLabel>Source d'énergie</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Sélectionnez une source" /></SelectTrigger></FormControl><SelectContent><SelectItem value="groupe">Groupe</SelectItem><SelectItem value="snel">SNEL</SelectItem><SelectItem value="socodee">Socodee</SelectItem><SelectItem value="autre">Autre</SelectItem></SelectContent></Select><FormMessage /></FormItem> )}/>}
            {sourceValue === 'autre' && !isUpdate && (<FormField control={form.control} name="sourceOther" render={({ field }) => (<FormItem><FormLabel>Précisez la source</FormLabel><FormControl><Input placeholder="Source libre" {...field} /></FormControl><FormMessage /></FormItem>)}/> )}
            
            {/* --- Champs à remplir progressivement --- */}
            {isUpdate && entry?.startTime ? <InfoField label="Heure d'allumage usine" value={formatTime(entry.startTime)} /> : <FormField control={form.control} name="startTime" render={({ field }) => (<FormItem><FormLabel>Heure d'allumage de l'usine</FormLabel><div className="flex items-center gap-2"><FormControl><Input type="text" value={field.value ? field.value.toLocaleTimeString('fr-FR') : ''} readOnly placeholder="Cliquez sur l'horloge" /></FormControl><Button type="button" variant="outline" size="icon" onClick={() => setTimeToNow('startTime')}><Clock className="h-4 w-4" /></Button></div><FormMessage /></FormItem> )}/>}

            {isUpdate && (
                <>
                    {entry?.boosterTime ? <InfoField label="Heure début booster" value={formatTime(entry.boosterTime)} /> : <FormField control={form.control} name="boosterTime" render={({ field }) => (<FormItem><FormLabel>Heure de début booster</FormLabel><div className="flex items-center gap-2"><FormControl><Input type="text" value={field.value ? field.value.toLocaleTimeString('fr-FR') : ''} readOnly placeholder="Cliquez sur l'horloge" /></FormControl><Button type="button" variant="outline" size="icon" onClick={() => setTimeToNow('boosterTime')}><Clock className="h-4 w-4" /></Button></div><FormMessage /></FormItem> )}/>}
                    
                    {entry?.endTime ? <InfoField label="Heure de fin" value={formatTime(entry.endTime)} /> : <FormField control={form.control} name="endTime" render={({ field }) => (<FormItem><FormLabel>Heure de fin</FormLabel><div className="flex items-center gap-2"><FormControl><Input type="text" value={field.value ? field.value.toLocaleTimeString('fr-FR') : ''} readOnly placeholder="Cliquez sur l'horloge" /></FormControl><Button type="button" variant="outline" size="icon" onClick={() => setTimeToNow('endTime')}><Clock className="h-4 w-4" /></Button></div><FormMessage /></FormItem> )}/>}
                    
                    <FormField control={form.control} name="bottlesProduced" render={({ field }) => (<FormItem><FormLabel>Nombre de bouteilles produites</FormLabel><FormControl><Input type="number" placeholder="ex: 50" {...field} value={field.value ?? 0} /></FormControl><FormMessage /></FormItem> )}/>
                    <FormField control={form.control} name="observations" render={({ field }) => (<FormItem><FormLabel>Observations</FormLabel><FormControl><Textarea placeholder="RAS ou ajoutez une observation..." {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)}/>
                </>
            )}

            <DialogFooter>
                <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
