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
  Check,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '../ui/badge';
import { useToast } from '@/hooks/use-toast';

interface ParticipantsPanelProps {
  participants: Participant[];
  onStageParticipants: Participant[];
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
  toggleMute: (id: string) => void;
  toggleCamera: (id: string) => void;
  setFocus: (id: string | null) => void;
}

export function ParticipantsPanel({
  participants,
  onStageParticipants,
  setParticipants,
  toggleMute,
  toggleCamera,
  setFocus,
}: ParticipantsPanelProps) {
  const { toast } = useToast();
  const host = participants.find(p => p.isHost);

  const addGuest = () => {
    // This is a placeholder for a real invite flow.
    // In a real app, this would generate an invite link.
    console.log("Invite guest clicked");
    toast({
      title: "Invite Link Copied (Simulated)",
      description: "A shareable invite link has been copied to your clipboard.",
    })
  }

  return (
    <>
      <div className="p-4 border-b border-border/50">
        <h2 className="font-semibold">Participants ({participants.length})</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {participants.map((p) => {
            const isOnStage = onStageParticipants.some(onstage => onstage.id === p.id);
            return (
            <div key={p.id} className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={p.isScreenSharing ? undefined : p.image.imageUrl} alt={p.name} />
                <AvatarFallback>
                  <User className="size-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 truncate">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{p.name}</span>
                  {isOnStage && <Badge variant="secondary" className="gap-1 flex-shrink-0"><Check className="size-3 text-green-500"/> On Stage</Badge>}
                </div>
              </div>
              {host?.id !== p.id && !p.isScreenSharing &&(
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 flex-shrink-0"
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
                    className="size-8 flex-shrink-0"
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
                className="size-8 flex-shrink-0"
                onClick={() => setFocus(p.id)}
                aria-label="Focus"
                disabled={!isOnStage}
              >
                <Focus className="size-4" />
              </Button>
            </div>
          )})}
        </div>
      </ScrollArea>
      <Separator />
      <div className="p-4">
        <Button variant="outline" className="w-full" onClick={addGuest}>
          <Plus className="mr-2 size-4" />
          Invite Guest
        </Button>
      </div>
    </>
  );
}
