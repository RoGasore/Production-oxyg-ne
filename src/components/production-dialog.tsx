
"use client"

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { formatDuration } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Clock } from 'lucide-react';
import type { ProductionEntry } from '@/types';

const formSchema = z.object({
  productionDate: z.date(),
  startTime: z.date({ required_error: "L'heure de début est requise." }),
  boosterTime: z.date({ required_error: "L'heure de début du booster est requise." }),
  source: z.enum(['groupe', 'snel', 'socodee', 'autre']),
  sourceOther: z.string().optional(),
  bottlesProduced: z.coerce.number().min(0, "Doit être un nombre positif."),
  endTime: z.date({ required_error: "L'heure de fin est requise." }),
  producer: z.string().min(1, "Le nom du producteur est requis."),
  observations: z.string().optional(),
}).refine(data => {
    if (data.source === 'autre') {
        return data.sourceOther && data.sourceOther.length > 0;
    }
    return true;
}, {
    message: "Veuillez préciser la source 'autre'.",
    path: ["sourceOther"],
});

type ProductionFormValues = z.infer<typeof formSchema>;

interface ProductionDialogProps {
  onAddEntry: (entry: Omit<ProductionEntry, 'id'>) => void;
}

export function ProductionDialog({ onAddEntry }: ProductionDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<ProductionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productionDate: new Date(),
      source: 'groupe',
      producer: 'Rodrigue Gasore',
      observations: '',
      sourceOther: '',
      bottlesProduced: 0,
    },
  });

  const sourceValue = form.watch('source');

  const setTimeToNow = (field: keyof ProductionFormValues) => {
    form.setValue(field as any, new Date(), { shouldValidate: true });
  };

  const onSubmit = (data: ProductionFormValues) => {
    try {
        const durationMs = data.endTime.getTime() - data.startTime.getTime();
        if (durationMs < 0) {
            toast({
                variant: 'destructive',
                title: 'Erreur de saisie',
                description: "L'heure de fin ne peut pas être antérieure à l'heure de début.",
            });
            return;
        }

        const newEntry: Omit<ProductionEntry, 'id'> = {
            ...data,
            source: data.source === 'autre' ? data.sourceOther! : data.source,
            duration: formatDuration(durationMs),
        };

        onAddEntry(newEntry);
        toast({
            title: 'Succès',
            description: 'Nouvelle entrée de production ajoutée.',
        });
        setOpen(false);
        form.reset({
            productionDate: new Date(),
            source: 'groupe',
            producer: 'Rodrigue Gasore',
            observations: '',
            sourceOther: '',
            bottlesProduced: 0,
        });
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Erreur',
            description: "Une erreur est survenue lors de l'ajout de l'entrée.",
        })
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="ml-auto gap-1">
          <PlusCircle className="h-4 w-4" />
          Nouvelle entrée
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nouvelle Fiche de Production</DialogTitle>
          <DialogDescription>
            Remplissez les détails ci-dessous. Cliquez sur l'horloge pour enregistrer l'heure actuelle.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Heure de début machine</FormLabel>
                        <div className="flex items-center gap-2">
                            <FormControl>
                                <Input type="text" value={field.value ? field.value.toLocaleTimeString('fr-FR') : ''} readOnly placeholder="Cliquez sur l'horloge" />
                            </FormControl>
                            <Button type="button" variant="outline" size="icon" onClick={() => setTimeToNow('startTime')}>
                                <Clock className="h-4 w-4" />
                            </Button>
                        </div>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="boosterTime"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Heure de début booster</FormLabel>
                        <div className="flex items-center gap-2">
                            <FormControl>
                                <Input type="text" value={field.value ? field.value.toLocaleTimeString('fr-FR') : ''} readOnly placeholder="Cliquez sur l'horloge" />
                            </FormControl>
                            <Button type="button" variant="outline" size="icon" onClick={() => setTimeToNow('boosterTime')}>
                                <Clock className="h-4 w-4" />
                            </Button>
                        </div>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Source d'énergie</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez une source" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="groupe">Groupe</SelectItem>
                                <SelectItem value="snel">SNEL</SelectItem>
                                <SelectItem value="socodee">Socodee</SelectItem>
                                <SelectItem value="autre">Autre</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                {sourceValue === 'autre' && (
                     <FormField
                        control={form.control}
                        name="sourceOther"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Précisez la source</FormLabel>
                                <FormControl>
                                    <Input placeholder="Source libre" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                <FormField
                    control={form.control}
                    name="bottlesProduced"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nombre de bouteilles produites</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="ex: 50" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Heure de fin</FormLabel>
                        <div className="flex items-center gap-2">
                            <FormControl>
                                <Input type="text" value={field.value ? field.value.toLocaleTimeString('fr-FR') : ''} readOnly placeholder="Cliquez sur l'horloge" />
                            </FormControl>
                            <Button type="button" variant="outline" size="icon" onClick={() => setTimeToNow('endTime')}>
                                <Clock className="h-4 w-4" />
                            </Button>
                        </div>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="producer"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Produit par</FormLabel>
                        <FormControl>
                            <Input placeholder="Nom du producteur" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
             <FormField
                control={form.control}
                name="observations"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Observations</FormLabel>
                    <FormControl>
                        <Textarea placeholder="Ajoutez une observation..." {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <DialogFooter>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
