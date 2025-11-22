
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Plus, Trash2, Server } from 'lucide-react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';

const destinationSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  url: z.string().url('Invalid URL format'),
  key: z.string().min(1, 'Stream key is required'),
});

const formSchema = z.object({
  destinations: z.array(destinationSchema),
});

type DestinationFormValues = z.infer<typeof formSchema>;
export type RtmpDestination = z.infer<typeof destinationSchema>;

const useRtmpDestinations = () => {
    const [destinations, setDestinations] = useState<RtmpDestination[]>([]);
  
    useEffect(() => {
      try {
        const item = window.localStorage.getItem('rtmp-destinations');
        const parsedItem = item ? JSON.parse(item) : [];
        if (Array.isArray(parsedItem)) {
            setDestinations(parsedItem);
        }
      } catch (error) {
        console.warn('Error reading localStorage "rtmp-destinations":', error);
        setDestinations([]);
      }
    }, []);
  
    const saveDestinations = (newDestinations: RtmpDestination[]) => {
      try {
        setDestinations(newDestinations);
        window.localStorage.setItem('rtmp-destinations', JSON.stringify(newDestinations));
      } catch (error) {
        console.warn('Error setting localStorage "rtmp-destinations":', error);
      }
    };
  
    return { destinations, saveDestinations };
  };
  

export function SettingsDialog() {
  const { destinations: savedDestinations, saveDestinations } = useRtmpDestinations();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<DestinationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destinations: savedDestinations,
    },
  });

  useEffect(() => {
    if (open) {
      reset({ destinations: savedDestinations });
    }
  }, [savedDestinations, open, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'destinations',
  });

  const onSubmit = (data: DestinationFormValues) => {
    saveDestinations(data.destinations);
    toast({
      title: 'Settings Saved',
      description: 'Your RTMP destinations have been updated.',
    });
    setOpen(false);
  };
  
  const handleAddNew = () => {
    append({ id: crypto.randomUUID(), name: '', url: '', key: '' });
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Settings">
          <Settings className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your account and RTMP destinations. Changes are saved locally.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <h3 className="text-lg font-medium">RTMP Destinations</h3>
            {fields.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-8">
                    <Server className="mx-auto size-8 mb-2"/>
                    No RTMP destinations added yet.
                </div>
            )}
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg space-y-3 relative">
                <div className="space-y-1">
                  <Label htmlFor={`destinations.${index}.name`}>Name</Label>
                  <Input
                    id={`destinations.${index}.name`}
                    {...register(`destinations.${index}.name`)}
                    placeholder="e.g., YouTube"
                  />
                  {errors.destinations?.[index]?.name && (
                    <p className="text-sm text-destructive">{errors.destinations[index]?.name?.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`destinations.${index}.url`}>Server URL</Label>
                  <Input
                    id={`destinations.${index}.url`}
                    {...register(`destinations.${index}.url`)}
                    placeholder="rtmp://a.rtmp.youtube.com/live2"
                  />
                  {errors.destinations?.[index]?.url && (
                    <p className="text-sm text-destructive">{errors.destinations[index]?.url?.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`destinations.${index}.key`}>Stream Key</Label>
                  <Input
                    id={`destinations.${index}.key`}
                    {...register(`destinations.${index}.key`)}
                    type="password"
                    placeholder="xxxx-xxxx-xxxx-xxxx"
                  />
                  {errors.destinations?.[index]?.key && (
                    <p className="text-sm text-destructive">{errors.destinations[index]?.key?.message}</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                  onClick={() => remove(index)}
                  aria-label="Remove destination"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
          
          <Button type="button" variant="outline" onClick={handleAddNew}>
            <Plus className="mr-2 size-4" /> Add Destination
          </Button>

          <Separator />
          
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="ghost">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={!isDirty}>Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
