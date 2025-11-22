'use client';

import Image from 'next/image';
import type { Participant, LayoutMode } from '@/lib/types';
import { MicOff, VideoOff, Maximize, Shrink, Pin, Monitor, User, Maximize2, Minimize2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRef, useEffect, useState } from 'react';

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
  const cardRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!cardRef.current) return;
    if (!document.fullscreenElement) {
      cardRef.current.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const showVideo = participant.isCameraOn && participant.stream;
  const isCircle = layout === 'circle' && !isFocused && !participant.isScreenSharing;

  return (
    <div ref={cardRef} className="relative w-full h-full flex flex-col items-center gap-2 group">
        <div
        className={cn(
            "w-full h-full bg-card/50 border-0 overflow-hidden relative transition-all duration-300",
            isCircle ? "rounded-full aspect-square" : "rounded-lg",
            isFullscreen && "rounded-none"
        )}
        >
        {showVideo ? (
            <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={participant.isHost || participant.isMuted}
            className={cn(
                "w-full h-full",
                participant.isScreenSharing ? "object-contain" : "object-cover",
            )}
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
            
        {!showVideo && !isCircle && <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />}
        
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
        
        <div className={cn(
            "absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity",
            isFullscreen && "opacity-100"
            )}>
            {!isCircle && (
                <Button variant="ghost" size="icon" onClick={onFocus} className="text-white hover:bg-white/20 hover:text-white h-9 w-9">
                {isFocused ? (
                    <Shrink className="size-5" />
                ) : (
                    <Maximize className="size-5" />
                )}
                <span className="sr-only">{isFocused ? 'Shrink' : 'Focus'}</span>
                </Button>
            )}
            <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-white hover:bg-white/20 hover:text-white h-9 w-9">
                {isFullscreen ? <Minimize2 className="size-5" /> : <Maximize2 className="size-5" />}
                <span className="sr-only">{isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}</span>
            </Button>
        </div>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-foreground drop-shadow-md max-w-full truncate">
            {participant.isScreenSharing && <Monitor className="size-4 text-accent" />}
            {participant.name}
        </div>
    </div>
  );
}
