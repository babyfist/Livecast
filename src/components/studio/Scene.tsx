'use client';

import type { Participant } from '@/lib/types';
import { ParticipantCard } from './ParticipantCard';
import { AIBanner } from './AIBanner';
import { cn } from '@/lib/utils';

interface SceneProps {
  participants: Participant[];
  focusedParticipantId: string | null;
  setFocus: (id: string | null) => void;
  bannerText: string;
}

export function Scene({
  participants,
  focusedParticipantId,
  setFocus,
  bannerText,
}: SceneProps) {
  const focusedParticipant = participants.find((p) => p.id === focusedParticipantId);
  const otherParticipants = participants.filter((p) => p.id !== focusedParticipantId);

  return (
    <div className="flex-1 relative bg-black/80 p-4 flex flex-col gap-4 overflow-hidden">
      {participants.length === 0 && (
         <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground text-lg">Turn on camera to join the stage</p>
         </div>
      )}
      {focusedParticipant ? (
        <div className="flex-1 flex flex-col md:flex-row gap-4 h-full">
          <div className="flex-1 transition-all duration-300">
            <ParticipantCard
              participant={focusedParticipant}
              isFocused
              onFocus={() => setFocus(null)}
            />
          </div>
          {otherParticipants.length > 0 && (
             <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto md:w-48 lg:w-64">
             {otherParticipants.map((p) => (
               <div key={p.id} className="md:h-1/4 w-40 md:w-full flex-shrink-0">
                 <ParticipantCard
                   participant={p}
                   isFocused={false}
                   onFocus={() => setFocus(p.id)}
                 />
               </div>
             ))}
           </div>
          )}
        </div>
      ) : (
        <div
          className={cn(
            'grid flex-1 gap-4 transition-all duration-300',
            participants.length === 1 && 'grid-cols-1 grid-rows-1',
            participants.length === 2 && 'grid-cols-2 grid-rows-1',
            participants.length >= 3 && participants.length <= 4 && 'grid-cols-2 grid-rows-2',
            participants.length > 4 && 'grid-cols-3 grid-rows-2',
          )}
        >
          {participants.map((p) => (
            <ParticipantCard
              key={p.id}
              participant={p}
              isFocused={false}
              onFocus={() => setFocus(p.id)}
            />
          ))}
        </div>
      )}
      <AIBanner text={bannerText} />
    </div>
  );
}
