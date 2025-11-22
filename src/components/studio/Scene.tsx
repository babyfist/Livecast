'use client';

import { useMemo } from 'react';
import type { Participant, LayoutMode } from '@/lib/types';
import { ParticipantCard } from './ParticipantCard';
import { AIBanner } from './AIBanner';
import { cn } from '@/lib/utils';

interface SceneProps {
  participants: Participant[];
  focusedParticipantId: string | null;
  setFocus: (id: string | null) => void;
  bannerText: string;
  layout: LayoutMode;
}

export function Scene({
  participants,
  focusedParticipantId,
  setFocus,
  bannerText,
  layout
}: SceneProps) {
  
  const manualFocusParticipant = participants.find((p) => p.id === focusedParticipantId);

  const autoFocusParticipant = useMemo(() => {
    if (layout !== 'focus' || participants.length === 0) return null;
    const screenShare = participants.find(p => p.isScreenSharing);
    return screenShare || participants[0];
  }, [participants, layout]);

  const focusedParticipant = layout === 'focus' ? autoFocusParticipant : manualFocusParticipant;
  
  const otherParticipants = useMemo(() => {
    if (!focusedParticipant) return participants;
    return participants.filter((p) => p.id !== focusedParticipant.id);
  }, [participants, focusedParticipant]);


  const isFocusView = !!focusedParticipant;
  const mainParticipants = isFocusView ? [focusedParticipant] : participants;
  const sidebarParticipants = isFocusView ? otherParticipants : [];

  return (
    <div className="flex-1 relative bg-black/80 p-4 flex flex-col gap-4 overflow-hidden">
      {participants.length === 0 && (
         <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground text-lg">Your guests will appear here once they join</p>
         </div>
      )}
      
      <div className={cn("flex-1 flex gap-4 h-full", sidebarParticipants.length > 0 ? "flex-col md:flex-row" : "flex-col")}>
        <div
            className={cn(
                'flex-1 transition-all duration-300',
                !isFocusView && layout === 'grid' && 'grid gap-4',
                !isFocusView && layout === 'circle' && 'flex flex-wrap items-center justify-center gap-6',
                !isFocusView && mainParticipants.length === 1 && 'grid-cols-1 grid-rows-1',
                !isFocusView && mainParticipants.length === 2 && 'grid-cols-2 grid-rows-1',
                !isFocusView && mainParticipants.length >= 3 && mainParticipants.length <= 4 && 'grid-cols-2 grid-rows-2',
                !isFocusView && mainParticipants.length > 4 && 'grid-cols-3 grid-rows-2',
            )}
            >
            {mainParticipants.map((p) => (
                <div 
                    key={p.id}
                    className={cn(
                        "flex flex-col items-center justify-center gap-2",
                        !isFocusView && "cursor-pointer",
                        !isFocusView && layout === 'circle' && "w-40 h-40 md:w-48 md:h-48 lg:w-56 lg:h-56"
                    )}
                    onClick={() => !isFocusView && setFocus(p.id)}
                >
                    <ParticipantCard
                        participant={p}
                        isFocused={isFocusView}
                        onFocus={() => isFocusView ? setFocus(null) : setFocus(p.id)}
                        layout={isFocusView ? 'grid' : layout}
                    />
                </div>
            ))}
        </div>

        {sidebarParticipants.length > 0 && (
            <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto w-full md:w-48 lg:w-64 pb-2 md:pb-0">
            {sidebarParticipants.map((p) => (
                <div 
                    key={p.id}
                    className={cn(
                        "flex-shrink-0 cursor-pointer w-40 md:w-full",
                        layout === 'circle' && 'h-40 md:h-auto md:aspect-square'
                    )}
                    onClick={() => setFocus(p.id)}
                    >
                    <ParticipantCard
                        participant={p}
                        isFocused={false}
                        onFocus={() => setFocus(p.id)}
                        layout={layout}
                    />
                </div>
            ))}
            </div>
        )}
      </div>
      
      <AIBanner text={bannerText} />
    </div>
  );
}
