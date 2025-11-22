'use client';

import Image from 'next/image';
import type { Participant, LayoutMode } from '@/lib/types';
import { MicOff, VideoOff, Maximize, Shrink, Pin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRef, useEffect } from 'react';

interface ParticipantCardProps {
  participant: Participant;
  isFocused: boolean;
  onFocus: () => void;
  layout: LayoutMode;
}

export function ParticipantCard({
  participant,
  isFocused,
  onFocus,
  layout
}: ParticipantCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream]);

  const showVideo = (participant.isCameraOn || participant.isScreenSharing) && participant.stream;
  const isCircle = layout === 'circle' && !isFocused && !participant.isScreenSharing;

  return (
    <Card
      className={cn(
        "w-full h-full bg-card/50 border-0 overflow-hidden group relative transition-all duration-300",
        isCircle ? "rounded-full aspect-square" : "rounded-lg"
      )}
    >
      {showVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={participant.isHost || participant.isMuted}
          className="object-cover w-full h-full"
        />
      ) : (
        <>
          <Image
            src={participant.image.imageUrl}
            alt={participant.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            data-ai-hint={participant.image.imageHint}
            priority={isFocused}
          />
          <div className="absolute inset-0 bg-black/50" />
        </>
      )}

      {!showVideo && <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />}
      
      <div className="absolute top-2 left-2 flex items-center gap-2">
        {participant.isMuted && (
          <div className="p-1.5 bg-background/70 rounded-md backdrop-blur-sm">
            <MicOff className="size-4 text-destructive" />
          </div>
        )}
        {!participant.isCameraOn && !participant.isScreenSharing && (
          <div className="p-1.5 bg-background/70 rounded-md backdrop-blur-sm">
            <VideoOff className="size-4 text-destructive" />
          </div>
        )}
      </div>

      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
           {participant.isScreenSharing && <Pin className="size-4 text-accent" />}
          <p className="text-sm font-medium text-white drop-shadow-md bg-black/20 px-2 py-1 rounded-md">
            {participant.name}
          </p>
        </div>
      </div>

      {!isCircle && (
         <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button variant="ghost" size="icon" onClick={onFocus} className="text-white hover:bg-white/20 hover:text-white h-12 w-12">
              {isFocused ? (
                <Shrink className="size-6" />
              ) : (
                <Maximize className="size-6" />
              )}
              <span className="sr-only">{isFocused ? 'Shrink' : 'Focus'}</span>
            </Button>
          </div>
      )}
    </Card>
  );
}
