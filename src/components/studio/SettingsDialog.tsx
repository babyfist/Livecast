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
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';
import type { RtmpDestination } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';

const destinationSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  url: z.string().url('Invalid URL format'),
  key: z.string().min(1, 'Stream key is required'),
  platform: z.enum(['youtube', 'twitch', 'kick', 'x']),
  channelId: z.string().min(1, 'Channel ID is required'),
});

const formSchema = z.object({
  destinations: z.array(destinationSchema),
});

type DestinationFormValues = z.infer<typeof formSchema>;

interface SettingsDialogProps {
    savedDestinations: RtmpDestination[];
    onDestinationsChange: (destinations: RtmpDestination[]) => void;
}

export function SettingsDialog({ savedDestinations, onDestinationsChange }: SettingsDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm<DestinationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destinations: savedDestinations,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({ destinations: savedDestinations });
    }
  }, [savedDestinations, open, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'destinations',
  });

  const onSubmit = (data: DestinationFormValues) => {
    try {
        window.localStorage.setItem('rtmp-destinations', JSON.stringify(data.destinations));
    } catch (error) {
        console.warn('Error setting localStorage "rtmp-destinations":', error);
    }
    onDestinationsChange(data.destinations);

    toast({
      title: 'Settings Saved',
      description: 'Your RTMP destinations have been updated.',
    });
    setOpen(false);
  };
  
  const handleAddNew = () => {
    append({ 
        id: crypto.randomUUID(), 
        name: '', 
        url: '', 
        key: '', 
        platform: 'youtube', 
        channelId: '' 
    });
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  <FormField
                    control={form.control}
                    name={`destinations.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., YouTube" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`destinations.${index}.platform`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a platform" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="youtube">YouTube</SelectItem>
                                <SelectItem value="twitch">Twitch</SelectItem>
                                <SelectItem value="kick">Kick</SelectItem>
                                <SelectItem value="x">X (Twitter)</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name={`destinations.${index}.channelId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Channel ID</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., UC..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`destinations.${index}.url`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Server URL</FormLabel>
                        <FormControl>
                          <Input placeholder="rtmp://a.rtmp.youtube.com/live2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`destinations.${index}.key`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stream Key</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="xxxx-xxxx-xxxx-xxxx" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
              <Button type="submit" disabled={!form.formState.isDirty}>Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
