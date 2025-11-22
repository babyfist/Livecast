'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { RtmpDestination } from '@/lib/types';
import { Server, Podcast } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

interface GoLiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  destinations: RtmpDestination[];
  onStartStreaming: (selectedIds: string[]) => void;
}

export function GoLiveDialog({
  open,
  onOpenChange,
  destinations,
  onStartStreaming,
}: GoLiveDialogProps) {
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setSelectedDestinations((prev) =>
      checked ? [...prev, id] : prev.filter((dId) => dId !== id)
    );
  };

  const handleStartClick = () => {
    onStartStreaming(selectedDestinations);
  };
  
  const allSelected = destinations.length > 0 && selectedDestinations.length === destinations.length;
  const toggleSelectAll = () => {
      if(allSelected) {
          setSelectedDestinations([]);
      } else {
          setSelectedDestinations(destinations.map(d => d.id));
      }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Go Live</DialogTitle>
          <DialogDescription>
            Select the destinations you want to stream to.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
            <div className="flex items-center space-x-2">
                <Checkbox id="select-all" checked={allSelected} onCheckedChange={toggleSelectAll} disabled={destinations.length === 0} />
                <Label htmlFor="select-all" className="font-medium">Select All</Label>
            </div>
            <ScrollArea className="max-h-64 pr-4">
                <div className="space-y-3">
                    {destinations.length > 0 ? (
                        destinations.map((dest) => (
                        <div key={dest.id} className="flex items-center space-x-3 rounded-md border p-3">
                            <Checkbox
                            id={`dest-${dest.id}`}
                            checked={selectedDestinations.includes(dest.id)}
                            onCheckedChange={(checked) => handleCheckboxChange(dest.id, !!checked)}
                            />
                            <Label htmlFor={`dest-${dest.id}`} className="flex-1 cursor-pointer">
                                <div className="font-semibold">{dest.name}</div>
                                <div className="text-xs text-muted-foreground truncate">{dest.url}</div>
                            </Label>
                        </div>
                        ))
                    ) : (
                        <div className="text-center text-sm text-muted-foreground py-8">
                            <Server className="mx-auto size-8 mb-2"/>
                            No RTMP destinations configured. Please add one in Settings.
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleStartClick}
            disabled={selectedDestinations.length === 0}
          >
            <Podcast className="mr-2 size-4" />
            Start Streaming
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
