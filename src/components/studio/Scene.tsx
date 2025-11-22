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

  // Determine the focused participant based on layout mode (auto for 'focus', manual for others)
  const focusedParticipant = layout === 'focus' ? autoFocusParticipant : manualFocusParticipant;
  
  const otherParticipants = useMemo(() => {
    if (!focusedParticipant) return participants;
    return participants.filter((p) => p.id !== focusedParticipant.id);
  }, [participants, focusedParticipant]);


  const isFocusView = !!focusedParticipant;
  // In focus view, there's one main participant. In grid/circle view, all 'otherParticipants' are the main participants.
  const mainParticipants = isFocusView ? [focusedParticipant] : otherParticipants;

  return (
    <div className="flex-1 relative bg-black/80 p-4 flex flex-col gap-4 overflow-hidden">
      {participants.length === 0 && (
         <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground text-lg">Your guests will appear here once they join</p>
         </div>
      )}
      
      <div className="flex-1 flex flex-col gap-4 h-full min-h-0 relative">
        <div
            className={cn(
                'flex-1 transition-all duration-300 min-h-0 min-w-0',
                !isFocusView && layout === 'grid' && 'grid gap-4 place-content-center',
                !isFocusView && layout === 'circle' && 'flex flex-wrap items-center justify-center gap-6',
                !isFocusView && mainParticipants.length === 1 && 'grid-cols-1 grid-rows-1',
                !isFocusView && mainParticipants.length === 2 && 'grid-cols-2 grid-rows-1',
                !isFocusView && mainParticipants.length >= 3 && mainParticipants.length <= 4 && 'grid-cols-2 grid-rows-2',
                !isFocusView && mainParticipants.length > 4 && mainParticipants.length <= 6 && 'grid-cols-3 grid-rows-2',
                !isFocusView && mainParticipants.length > 6 && 'grid-cols-4 grid-rows-3'
            )}
            >
            {mainParticipants.map((p) => (
                <div 
                    key={p.id}
                    className={cn(
                        "flex items-center justify-center min-h-0",
                        !isFocusView && "cursor-pointer",
                        !isFocusView && layout === 'circle' && "w-40 h-auto aspect-square md:w-48 lg:w-56"
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

        {isFocusView && otherParticipants.length > 0 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 justify-center w-full p-2">
            {otherParticipants.map((p) => (
                <div 
                    key={p.id}
                    className={cn(
                        "flex-shrink-0 cursor-pointer w-24 h-auto aspect-square md:w-28 lg:w-32 transition-all duration-300 hover:scale-105"
                    )}
                    onClick={() => setFocus(p.id)}
                    >
                    <ParticipantCard
                        participant={p}
                        isFocused={false}
                        onFocus={() => setFocus(p.id)}
                        layout="circle" // Always circles when in the bottom bar
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
