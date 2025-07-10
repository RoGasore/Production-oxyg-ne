
"use client"

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import type { SaleEntry } from '@/types';
import { useSettings } from '@/hooks/use-settings';

const saleSchema = z.object({
  saleDate: z.date({ required_error: "La date de vente est requise." }),
  clientType: z.enum(['hopital', 'entreprise'], { required_error: "Le type de client est requis."}),
  clientName: z.string().min(1, "Le nom du client est requis."),
  ourBottlesCount: z.coerce.number().min(0, "Le nombre doit être positif."),
  recipientName: z.string().optional(),
  clientBottlesCount: z.coerce.number().optional(),
  bottleNumbers: z.string().optional(),
  status: z.enum(['pending', 'completed']),
}).refine(data => data.clientType !== 'hopital' || (data.recipientName && data.recipientName.length > 0), {
    message: "Le nom de la personne qui récupère est requis pour un hôpital.",
    path: ["recipientName"],
});


type FormValues = z.infer<typeof saleSchema>;

interface SaleDialogProps {
  mode: 'create' | 'update' | null;
  entry?: SaleEntry;
  onAddEntry: (data: Omit<SaleEntry, 'id'>) => void;
  onUpdateEntry: (id: string, data: Partial<Omit<SaleEntry, 'id'>>) => void;
  onOpenChange: (isOpen: boolean) => void;
}

export function SaleDialog({ mode, entry, onAddEntry, onUpdateEntry, onOpenChange }: SaleDialogProps) {
  const { toast } = useToast();
  const { settings } = useSettings();

  const form = useForm<FormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      saleDate: new Date(),
      clientType: 'hopital',
      clientName: '',
      recipientName: '',
      ourBottlesCount: 0,
      clientBottlesCount: 0,
      bottleNumbers: '',
      status: 'pending',
    },
  });

  useEffect(() => {
    if (mode === 'create') {
      form.reset({
        saleDate: new Date(),
        clientType: 'hopital',
        clientName: '',
        recipientName: '',
        ourBottlesCount: 0,
        clientBottlesCount: 0,
        bottleNumbers: '',
        status: 'pending'
      });
    } else if (mode === 'update' && entry) {
      form.reset({
        ...entry,
        saleDate: new Date(entry.saleDate),
        ourBottlesCount: entry.ourBottlesCount || 0,
        clientBottlesCount: entry.clientBottlesCount || 0
      });
    }
  }, [mode, entry, form]);

  const clientType = form.watch('clientType');
  
  const handleSubmit = (data: FormValues) => {
    const finalData: Omit<SaleEntry, 'id'> = {
        saleDate: data.saleDate,
        clientType: data.clientType,
        clientName: data.clientName,
        ourBottlesCount: data.ourBottlesCount,
        recipientName: data.recipientName || '',
        clientBottlesCount: data.clientBottlesCount || 0,
        bottleNumbers: data.bottleNumbers || '',
        status: mode === 'create' ? 'pending' : data.status,
    };
    
    if (mode === 'create') {
      onAddEntry(finalData);
      toast({ title: 'Succès', description: 'Nouvelle vente enregistrée.' });
    } else if (mode === 'update' && entry) {
      onUpdateEntry(entry.id, finalData);
      toast({ title: 'Succès', description: 'Fiche de vente mise à jour.' });
    }
    onOpenChange(false);
  };
  
  const isOpen = mode !== null;
  const dialogTitle = mode === 'create' ? 'Enregistrer une Vente' : 'Modifier la Vente';
  const dialogDescription = "Remplissez les détails de la vente ci-dessous.";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-2">
            
            <FormField control={form.control} name="clientType" render={({ field }) => (
                <FormItem className="space-y-3"><FormLabel>Type de client</FormLabel>
                <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-4">
                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="hopital" /></FormControl><FormLabel className="font-normal">Hôpital</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="entreprise" /></FormControl><FormLabel className="font-normal">Entreprise</FormLabel></FormItem>
                    </RadioGroup>
                </FormControl><FormMessage /></FormItem>
            )}/>
            
            <FormField control={form.control} name="saleDate" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Date de vente</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? formatDate(field.value) : <span>Choisissez une date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem> )}/>

            <FormField control={form.control} name="clientName" render={({ field }) => (<FormItem><FormLabel>Nom de {clientType === 'hopital' ? "l'hôpital" : "l'entreprise"}</FormLabel><FormControl><Input placeholder={clientType === 'hopital' ? "ex: Hôpital Général" : "ex: Mining Corp"} {...field} /></FormControl><FormMessage /></FormItem> )}/>
            
            {clientType === 'hopital' && (
                 <FormField control={form.control} name="recipientName" render={({ field }) => (<FormItem><FormLabel>Nom de la personne qui récupère</FormLabel><FormControl><Input placeholder="ex: Jean Dupont" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem> )}/>
            )}
            
            <FormField control={form.control} name="ourBottlesCount" render={({ field }) => (<FormItem><FormLabel>Nombre de bouteilles ({settings.companyName})</FormLabel><FormControl><Input type="number" placeholder="ex: 10" {...field} min="0" value={field.value ?? 0} /></FormControl><FormMessage /></FormItem> )}/>

            <FormField control={form.control} name="clientBottlesCount" render={({ field }) => (<FormItem><FormLabel>Nombre de bouteilles du client</FormLabel><FormControl><Input type="number" placeholder="ex: 5" {...field} min="0" value={field.value ?? 0} /></FormControl><FormMessage /></FormItem> )}/>
            
            {clientType === 'hopital' && (
                <FormField control={form.control} name="bottleNumbers" render={({ field }) => (<FormItem><FormLabel>Numéros des bouteilles ({settings.companyName})</FormLabel><FormControl><Textarea placeholder="ex: 101, 102, 105..." {...field} value={field.value ?? ""} /></FormControl><FormDescription>Séparez les numéros par une virgule.</FormDescription><FormMessage /></FormItem> )}/>
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
