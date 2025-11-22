'use client';

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
  const focusedParticipant = participants.find((p) => p.id === focusedParticipantId);
  const otherParticipants = participants.filter((p) => p.id !== focusedParticipantId);

  return (
    <div className="flex-1 relative bg-black/80 p-4 flex flex-col gap-4 overflow-hidden">
      {participants.length === 0 && (
         <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground text-lg">Turn on your camera to join the stage</p>
         </div>
      )}
      {focusedParticipant ? (
        <div className="flex-1 flex flex-col md:flex-row gap-4 h-full">
          <div className="flex-1 transition-all duration-300">
            <ParticipantCard
              participant={focusedParticipant}
              isFocused
              onFocus={() => setFocus(null)}
              layout={layout}
            />
          </div>
          {otherParticipants.length > 0 && (
             <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto md:w-48 lg:w-64">
             {otherParticipants.map((p) => (
               <div key={p.id} className={cn(
                 "md:h-1/4 w-40 md:w-full flex-shrink-0",
                 layout === 'circle' && "aspect-square"
               )}>
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
      ) : (
        <div
          className={cn(
            'flex-1 transition-all duration-300',
            layout === 'grid' && 'grid gap-4',
            layout === 'circle' && 'flex flex-wrap items-center justify-center gap-6',
            participants.length === 1 && 'grid-cols-1 grid-rows-1',
            participants.length === 2 && 'grid-cols-2 grid-rows-1',
            participants.length >= 3 && participants.length <= 4 && 'grid-cols-2 grid-rows-2',
            participants.length > 4 && 'grid-cols-3 grid-rows-2',
          )}
        >
          {participants.map((p) => (
             <div key={p.id} className={cn(layout === 'circle' && "w-40 h-40 md:w-48 md:h-48 lg:w-56 lg:h-56")}>
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
      <AIBanner text={bannerText} />
    </div>
  );
}
