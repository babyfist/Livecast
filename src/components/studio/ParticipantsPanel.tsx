'use client';

import type { Participant } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Focus,
  User,
  Plus,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface ParticipantsPanelProps {
  participants: Participant[];
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
  toggleMute: (id: string) => void;
  toggleCamera: (id: string) => void;
  setFocus: (id: string | null) => void;
}

export function ParticipantsPanel({
  participants,
  setParticipants,
  toggleMute,
  toggleCamera,
  setFocus,
}: ParticipantsPanelProps) {
    
  const host = participants.find(p => p.isHost);

  const addGuest = () => {
    const guestId = `guest${participants.filter(p => !p.isHost).length + 3}`;
    const newGuest: Participant = {
        id: guestId,
        name: `Guest ${participants.length}`,
        isHost: false,
        isMuted: true,
        isCameraOn: false,
        isScreenSharing: false,
        image: {
            id: guestId,
            description: `Guest ${participants.length}`,
            imageUrl: `https://picsum.photos/seed/${guestId}/1280/720`,
            imageHint: "person portrait"
        }
    };
    setParticipants(prev => [...prev, newGuest]);
  }

  return (
    <aside className="w-full lg:w-80 bg-card/50 border-l border-border/50 flex flex-col">
      <div className="p-4 border-b border-border/50">
        <h2 className="font-semibold">Participants ({participants.length})</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {participants.map((p) => (
            <div key={p.id} className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={p.image.imageUrl} alt={p.name} />
                <AvatarFallback>
                  <User className="size-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">{p.name}</p>
              </div>
              {host?.id !== p.id && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => toggleMute(p.id)}
                    aria-label={p.isMuted ? 'Unmute' : 'Mute'}
                  >
                    {p.isMuted ? (
                      <MicOff className="size-4" />
                    ) : (
                      <Mic className="size-4" />
                    )}
                  </Button>
                   <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => toggleCamera(p.id)}
                    aria-label={p.isCameraOn ? 'Hide camera' : 'Show camera'}
                  >
                    {p.isCameraOn && !p.isScreenSharing ? (
                      <Video className="size-4" />
                    ) : (
                      <VideoOff className="size-4" />
                    )}
                  </Button>
                </>
              )}
               <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => setFocus(p.id)}
                aria-label="Focus"
              >
                <Focus className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
      <Separator />
      <div className="p-4">
        <Button variant="outline" className="w-full" onClick={addGuest}>
          <Plus className="mr-2 size-4" />
          Invite Guest
        </Button>
      </div>
    </aside>
  );
}
