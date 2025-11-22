'use client';

import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  UserPlus,
  Podcast,
  Loader,
  Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { generateSceneBanner } from '@/ai/flows/auto-scene-banner';
import { useToast } from '@/hooks/use-toast';
import type { Participant } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ControlsProps {
  host: Participant;
  toggleMute: () => void;
  toggleCamera: () => void;
  toggleScreenShare: () => void;
  isLive: boolean;
  handleGoLive: () => void;
  setBannerText: (text: string) => void;
  isScreenSharing: boolean;
}

const sceneOptions = [
    { value: "A host is introducing the stream.", label: "Intro" },
    { value: "A guest speaker is presenting their topic.", label: "Guest Speaker" },
    { value: "The host is sharing their screen to show a code demonstration.", label: "Code Demo" },
    { value: "Two speakers are having a discussion.", label: "Debate" },
    { value: "The host is wrapping up the stream.", label: "Outro" },
];

export function Controls({
  host,
  toggleMute,
  toggleCamera,
  toggleScreenShare,
  isLive,
  handleGoLive,
  setBannerText,
  isScreenSharing
}: ControlsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLive) {
      interval = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(interval);
  }, [isLive]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const handleSceneSelect = async (sceneDescription: string) => {
    if (!sceneDescription) return;
    setIsGenerating(true);
    setBannerText('');
    try {
      const result = await generateSceneBanner({ sceneDescription });
      setBannerText(result.bannerText);
    } catch (error) {
      console.error('Error generating banner:', error);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Could not generate banner. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <footer className="p-4 border-t border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="grid grid-cols-3 items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="lg" onClick={toggleMute} aria-label={host.isMuted ? 'Unmute' : 'Mute'}>
            {host.isMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
          </Button>
          <Button variant="outline" size="lg" onClick={toggleCamera} aria-label={host.isCameraOn ? 'Hide camera' : 'Show camera'}>
            {host.isCameraOn ? <Video className="size-5" /> : <VideoOff className="size-5" />}
          </Button>
           <Button variant={isScreenSharing ? "secondary" : "outline"} size="lg" onClick={toggleScreenShare} aria-label={isScreenSharing ? 'Stop sharing' : 'Share screen'}>
            <MonitorUp className="size-5" />
          </Button>
        </div>

        <div className="flex justify-center items-center gap-2">
            <Select onValueChange={handleSceneSelect} disabled={isGenerating}>
              <SelectTrigger className="w-[200px]" aria-label="Select AI banner scene">
                 <div className="flex items-center gap-2">
                    <Bot className="size-4 text-accent" />
                    <SelectValue placeholder="AI Lower-Thirds" />
                 </div>
              </SelectTrigger>
              <SelectContent>
                {sceneOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isGenerating && <Loader className="size-5 animate-spin text-accent" />}
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="lg" aria-label="Invite guest">
            <UserPlus className="size-5" />
          </Button>
          <Button
            size="lg"
            onClick={handleGoLive}
            className={cn(
              "min-w-36",
              isLive ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'
            )}
          >
            {isLive ? (
              <>
                <Podcast className="mr-2 size-5 animate-pulse" />
                <span>{formatTime(elapsedTime)}</span>
              </>
            ) : (
              'Go Live'
            )}
          </Button>
        </div>
      </div>
    </footer>
  );
}
