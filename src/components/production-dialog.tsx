
"use client"

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Clock, CalendarIcon } from 'lucide-react';
import { cn, formatTime, formatDate } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { ProductionEntry, SaleEntry } from '@/types';
import { useSettings } from '@/hooks/use-settings';
import { useData } from '@/components/data-sync-provider';

const productionSchema = z.object({
  productionDate: z.date({ required_error: "La date de production est requise." }),
  startTime: z.date({ required_error: "L'heure d'allumage est requise." }),
  source: z.string().min(1, "La source d'énergie est requise."),
  sourceOther: z.string().optional(),
  producer: z.string().min(1, "Le nom du producteur est requis."),
  boosterTime: z.date().optional().nullable(),
  endTime: z.date().optional().nullable(),
  bottlesProduced: z.coerce.number().optional().nullable(),
  pressure: z.coerce.number().optional().nullable(),
  observations: z.string().optional().nullable(),
  bottleDestination: z.enum(['hopital', 'hopital-entreprises']).optional().nullable(),
  otherClientName: z.string().optional().nullable(),
  otherClientBottlesCount: z.coerce.number().optional().nullable(),
}).refine(data => data.source !== 'autre' || (data.sourceOther && data.sourceOther.length > 0), {
    message: "Veuillez préciser la source 'autre'.",
    path: ["sourceOther"],
}).refine(data => data.bottleDestination !== 'hopital-entreprises' || (data.otherClientName && data.otherClientName.length > 0), {
    message: "Le nom de l'entreprise est requis.",
    path: ["otherClientName"],
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


const InfoField = ({ label, value }: { label: string; value: string | null | undefined}) => {
    if (!value) return null;
    return (
        <div className="flex items-center gap-2 text-sm">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <div>
                <span className="font-medium text-gray-800">{label}:</span>
                <span className="ml-2 text-gray-600">{value}</span>
            </div>
        </div>
    );
};


export function ProductionDialog({ mode, entry, onAddEntry, onUpdateEntry, onOpenChange }: ProductionDialogProps) {
  const { toast } = useToast();
  const { settings } = useSettings();
  const { setSaleEntries } = useData();

  const form = useForm<FormValues>({
    resolver: zodResolver(productionSchema),
    defaultValues: {
      productionDate: new Date(),
      source: 'snel',
      producer: settings.defaultProducer,
      observations: 'RAS',
      boosterTime: null,
      endTime: null,
      bottlesProduced: 0,
      pressure: 180,
      bottleDestination: 'hopital',
      otherClientName: '',
      otherClientBottlesCount: 0
    },
  });

  useEffect(() => {
    if (mode === 'create') {
      form.reset({
        productionDate: new Date(),
        startTime: undefined,
        source: 'snel',
        producer: settings.defaultProducer,
        sourceOther: '',
        boosterTime: null,
        endTime: null,
        bottlesProduced: 0,
        pressure: 180,
        observations: "RAS",
        bottleDestination: 'hopital',
        otherClientName: '',
        otherClientBottlesCount: 0
      });
    } else if (mode === 'update' && entry) {
      form.reset({
        ...entry,
        productionDate: new Date(entry.productionDate),
        startTime: new Date(entry.startTime),
        boosterTime: entry.boosterTime ? new Date(entry.boosterTime) : null,
        endTime: entry.endTime ? new Date(entry.endTime) : null,
        source: ['snel', 'groupe', 'socodee'].includes(entry.source) ? entry.source : 'autre',
        sourceOther: ['snel', 'groupe', 'socodee'].includes(entry.source) ? '' : entry.source,
        bottlesProduced: entry.bottlesProduced || 0,
        pressure: entry.pressure || 180,
        observations: entry.observations || 'RAS',
        bottleDestination: entry.bottleDestination || 'hopital',
        otherClientName: entry.otherClientName || '',
        otherClientBottlesCount: entry.otherClientBottlesCount || 0,
      });
    }
  }, [mode, entry, form, settings.defaultProducer]);

  const sourceValue = form.watch('source');
  const bottleDestination = form.watch('bottleDestination');
  
  const setTimeToNow = (field: 'startTime' | 'boosterTime' | 'endTime') => {
    form.setValue(field, new Date(), { shouldValidate: true });
  };
  
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
    const timeValue = e.target.value;
    if (timeValue) {
      const productionDate = form.getValues('productionDate');
      const newDate = new Date(productionDate);
      const [hours, minutes] = timeValue.split(':').map(Number);
      newDate.setHours(hours, minutes, 0, 0);
      field.onChange(newDate);
    } else {
      field.onChange(null);
    }
  };

  const handleSubmit = (data: FormValues) => {
    const finalData = {
        ...data,
        source: data.source === 'autre' ? data.sourceOther! : data.source,
    };
    
    if (mode === 'create') {
      const { productionDate, startTime, source, producer } = finalData;
      if (!startTime) {
        toast({ variant: "destructive", title: "Erreur", description: "L'heure d'allumage est requise." });
        return;
      }
      onAddEntry({ productionDate, startTime, source, producer });
      toast({ title: 'Succès', description: 'Nouvelle entrée de production créée.' });
    } else if (mode === 'update' && entry) {
       const startTime = new Date(entry.startTime);
       if (data.endTime && data.endTime.getTime() <= startTime.getTime()) {
          toast({ variant: "destructive", title: "Erreur", description: "L'heure de fin doit être après l'heure de début." });
          return;
       }
       if (data.boosterTime && data.boosterTime.getTime() <= startTime.getTime()) {
           toast({ variant: "destructive", title: "Erreur", description: "L'heure du booster doit être après l'heure d'allumage." });
           return;
       }
       if (data.endTime && data.boosterTime && data.endTime.getTime() <= data.boosterTime.getTime()) {
           toast({ variant: "destructive", title: "Erreur", description: "L'heure de fin doit être après l'heure du booster." });
           return;
       }

        const hadCompanyBottles = entry.otherClientBottlesCount && entry.otherClientBottlesCount > 0;
        const hasCompanyBottlesNow = finalData.bottleDestination === 'hopital-entreprises' && finalData.otherClientName && finalData.otherClientBottlesCount && finalData.otherClientBottlesCount > 0;

        onUpdateEntry(entry.id, finalData);
        
        if (hasCompanyBottlesNow && !hadCompanyBottles) {
            const newSale: SaleEntry = {
                id: Date.now().toString(),
                saleDate: finalData.productionDate,
                clientType: 'entreprise',
                clientName: finalData.otherClientName!,
                recipientName: '',
                ourBottlesCount: finalData.otherClientBottlesCount!,
                clientBottlesCount: 0,
                bottleNumbers: '',
                status: 'pending'
            };
            setSaleEntries(prevSales => [...prevSales, newSale]);
            toast({
                title: 'Mise à jour et Vente Créée',
                description: `La fiche de production est à jour et une vente a été créée pour ${newSale.clientName}.`,
            });
        } else {
            toast({ title: 'Succès', description: 'Fiche de production mise à jour.' });
        }
    }
    onOpenChange(false);
  };
  
  const isOpen = mode !== null;
  const isUpdate = mode === 'update';
  const isFullEdit = isUpdate && entry?.status === 'terminee';
  const formatForTimeInput = (date: Date | null | undefined) => date ? format(new Date(date), 'HH:mm') : '';

  const dialogTitle = isFullEdit ? 'Modifier la Fiche' : isUpdate ? 'Compléter la Fiche' : 'Démarrer une Fiche';
  const dialogDescription = isFullEdit ? 'Modifiez les informations de cette fiche.' : isUpdate ? 'Complétez les informations manquantes.' : 'Remplissez les détails de début de journée.';


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl md:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 md:gap-6 py-4 max-h-[70vh] overflow-y-auto pr-2 md:pr-4">
            
            {isFullEdit || !isUpdate ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="productionDate" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Date de production</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? formatDate(field.value) : <span>Choisissez une date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem> )}/>
                    <FormField control={form.control} name="producer" render={({ field }) => (<FormItem><FormLabel>Produit par</FormLabel><FormControl><Input placeholder="Nom du producteur" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                    <FormField control={form.control} name="source" render={({ field }) => (<FormItem><FormLabel>Source d'énergie</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Sélectionnez une source" /></SelectTrigger></FormControl><SelectContent><SelectItem value="groupe">Groupe</SelectItem><SelectItem value="snel">SNEL</SelectItem><SelectItem value="socodee">Socodee</SelectItem><SelectItem value="autre">Autre</SelectItem></SelectContent></Select><FormMessage /></FormItem> )}/>
                    {sourceValue === 'autre' && (<FormField control={form.control} name="sourceOther" render={({ field }) => (<FormItem><FormLabel>Précisez la source</FormLabel><FormControl><Input placeholder="Source libre" {...field} /></FormControl><FormMessage /></FormItem>)}/> )}
                    <FormField control={form.control} name="startTime" render={({ field }) => (<FormItem><FormLabel>Heure d'allumage de l'usine</FormLabel><div className="flex items-center gap-2"><FormControl><Input type="time" value={formatForTimeInput(field.value)} onChange={(e) => handleTimeChange(e, field)} /></FormControl><Button type="button" variant="outline" size="icon" onClick={() => setTimeToNow('startTime')}><Clock className="h-4 w-4" /></Button></div><FormMessage /></FormItem> )}/>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border p-4 rounded-lg">
                  <InfoField label="Date de production" value={formatDate(entry?.productionDate)} />
                  <InfoField label="Producteur" value={entry?.producer} />
                  <InfoField label="Source d'énergie" value={entry?.source.toUpperCase()} />
                  <InfoField label="Heure d'allumage" value={formatTime(entry?.startTime)} />
                </div>
            )}

            {isUpdate && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {entry?.boosterTime && !isFullEdit ? <InfoField label="Heure début booster" value={formatTime(entry.boosterTime)} /> : <FormField control={form.control} name="boosterTime" render={({ field }) => (<FormItem><FormLabel>Heure de début booster</FormLabel><div className="flex items-center gap-2"><FormControl><Input type="time" value={formatForTimeInput(field.value)} onChange={(e) => handleTimeChange(e, field)} /></FormControl><Button type="button" variant="outline" size="icon" onClick={() => setTimeToNow('boosterTime')}><Clock className="h-4 w-4" /></Button></div><FormMessage /></FormItem> )}/>}
                    
                    {entry?.endTime && !isFullEdit ? <InfoField label="Heure de fin" value={formatTime(entry.endTime)} /> : <FormField control={form.control} name="endTime" render={({ field }) => (<FormItem><FormLabel>Heure de fin</FormLabel><div className="flex items-center gap-2"><FormControl><Input type="time" value={formatForTimeInput(field.value)} onChange={(e) => handleTimeChange(e, field)} /></FormControl><Button type="button" variant="outline" size="icon" onClick={() => setTimeToNow('endTime')}><Clock className="h-4 w-4" /></Button></div><FormMessage /></FormItem> )}/>}
                    
                    {(entry?.status === 'terminee' || isFullEdit) && (
                        <>
                         <FormField
                            control={form.control} name="bottleDestination" render={({ field }) => (
                                <FormItem className="space-y-3 md:col-span-2"><FormLabel>Destination des bouteilles</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} value={field.value ?? undefined} className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="hopital" /></FormControl><FormLabel className="font-normal">Hôpital uniquement</FormLabel></FormItem>
                                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="hopital-entreprises" /></FormControl><FormLabel className="font-normal">Hôpital et Entreprises</FormLabel></FormItem>
                                    </RadioGroup>
                                </FormControl><FormMessage /></FormItem>
                         )}/>

                          <FormField control={form.control} name="bottlesProduced" render={({ field }) => (<FormItem><FormLabel>Bouteilles produites (Hôpital)</FormLabel><FormControl><Input type="number" placeholder="ex: 50" {...field} value={field.value ?? 0} min="0" /></FormControl><FormMessage /></FormItem> )}/>

                          {bottleDestination === 'hopital-entreprises' ? (
                            <>
                                <FormField control={form.control} name="otherClientName" render={({ field }) => (<FormItem><FormLabel>Nom de l'entreprise</FormLabel><FormControl><Input placeholder="ex: Socodee" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )}/>
                                <FormField control={form.control} name="otherClientBottlesCount" render={({ field }) => (<FormItem><FormLabel>Bouteilles (Entreprise)</FormLabel><FormControl><Input type="number" placeholder="ex: 10" {...field} value={field.value ?? 0} min="0" /></FormControl><FormMessage /></FormItem> )}/>
                            </>
                          ) : <div className="hidden md:block"></div>}
                           <FormField control={form.control} name="pressure" render={({ field }) => (<FormItem><FormLabel>Pression moyenne (bars)</FormLabel><FormControl><Input type="number" placeholder="ex: 180" {...field} value={field.value ?? 180} min="0" step="0.1" /></FormControl><FormDescription>Pression de remplissage (180-200 bars).</FormDescription><FormMessage /></FormItem> )}/>
                          <FormField control={form.control} name="observations" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Observations</FormLabel><FormControl><Textarea placeholder="RAS ou ajoutez une observation..." {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)}/>
                        </>
                    )}
                </div>
            )}

            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
                <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
