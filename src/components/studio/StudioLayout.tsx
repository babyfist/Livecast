'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { LayoutMode, Participant, RtmpDestination } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Header } from './Header';
import { Scene } from './Scene';
import { Controls } from './Controls';
import { ParticipantsPanel } from './ParticipantsPanel';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Video } from 'lucide-react';
import { GoLiveDialog } from './GoLiveDialog';
import { SettingsDialog } from './SettingsDialog';

export function StudioLayout() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [focusedParticipantId, setFocusedParticipantId] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [bannerText, setBannerText] = useState<string>('');
  const [layout, setLayout] = useState<LayoutMode>('grid');

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();
  
  const [isGoLiveDialogOpen, setGoLiveDialogOpen] = useState(false);
  const [rtmpDestinations, setRtmpDestinations] = useState<RtmpDestination[]>([]);
  const [activeDestinations, setActiveDestinations] = useState<string[]>([]);


  const host: Participant | undefined = useMemo(() => participants.find(p => p.isHost), [participants]);

  // Load RTMP destinations from local storage
  useEffect(() => {
    try {
      const item = window.localStorage.getItem('rtmp-destinations');
      const parsedItem = item ? JSON.parse(item) : [];
      if (Array.isArray(parsedItem)) {
          setRtmpDestinations(parsedItem);
      }
    } catch (error) {
      console.warn('Error reading localStorage "rtmp-destinations":', error);
      setRtmpDestinations([]);
    }
  }, []);

  // Request camera and mic permissions
  useEffect(() => {
    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
        setHasCameraPermission(true);
        const hostParticipant: Participant = {
          id: 'host',
          name: 'You (Host)',
          isHost: true,
          isMuted: false,
          isCameraOn: true,
          isScreenSharing: false,
          image: PlaceHolderImages.find((p) => p.id === 'host')!,
          stream: stream,
        };
        
        const guestParticipants: Participant[] = [
            {
                id: 'guest1',
                name: 'Alex',
                isHost: false,
                isMuted: true,
                isCameraOn: false,
                isScreenSharing: false,
                image: PlaceHolderImages.find(p => p.id === 'guest1')!,
                stream: undefined
            },
            {
                id: 'guest2',
                name: 'Samira',
                isHost: false,
                isMuted: true,
                isCameraOn: false,
                isScreenSharing: false,
                image: PlaceHolderImages.find(p => p.id === 'guest2')!,
                stream: undefined
            },
            {
                id: 'guest3',
                name: 'Kenji',
                isHost: false,
                isMuted: false,
                isCameraOn: false,
                isScreenSharing: false,
                image: PlaceHolderImages.find(p => p.id === 'guest3')!,
                stream: undefined
            }
        ]

        setParticipants([hostParticipant, ...guestParticipants]);

      } catch (err) {
        console.error('Error accessing media devices.', err);
        setHasCameraPermission(false);
        toast({
          variant: "destructive",
          title: "Camera/Mic Access Denied",
          description: "Please enable camera and microphone permissions in your browser to use this app.",
        });
      }
    };
    getMedia();

    return () => {
        localStream?.getTracks().forEach(track => track.stop());
    }
  }, [toast]);
  

  const onStageParticipants = useMemo(
    () => participants.filter((p) => (p.isCameraOn && p.stream) || p.isScreenSharing || (!p.stream && p.isCameraOn)),
    [participants]
  );
  
  useEffect(() => {
    if (focusedParticipantId && !onStageParticipants.find(p => p.id === focusedParticipantId)) {
      setFocusedParticipantId(null);
    }
  }, [onStageParticipants, focusedParticipantId]);

  const toggleMute = (participantId: string) => {
    const participant = participants.find(p => p.id === participantId);
    if (participant?.stream) {
      participant.stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
    }
    setParticipants((prev) =>
      prev.map((p) => (p.id === participantId ? { ...p, isMuted: !p.isMuted } : p))
    );
  };

  const toggleCamera = (participantId: string) => {
    const participant = participants.find(p => p.id === participantId);
    if(participant?.stream) {
      participant.stream.getVideoTracks().forEach(track => {
          track.enabled = !track.enabled;
      });
    }
    setParticipants((prev) =>
      prev.map((p) => (p.id === participantId ? { ...p, isCameraOn: !p.isCameraOn } : p))
    );
  };
  
  const toggleScreenShare = async () => {
    const screenShareParticipant = participants.find(p => p.isScreenSharing);
    if(screenShareParticipant) {
       // Stop screen sharing
      screenShareParticipant.stream?.getTracks().forEach(track => track.stop());
      setParticipants(prev => prev.filter(p => !p.isScreenSharing));
      if (focusedParticipantId === 'screenshare') {
        setFocusedParticipantId(null);
      }
    } else {
       // Start screen sharing
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const newScreenShare: Participant = {
          id: 'screenshare',
          name: 'Screen Share',
          isHost: false,
          isMuted: true,
          isCameraOn: false,
          isScreenSharing: true,
          image: PlaceHolderImages.find(p => p.id === 'screenshare')!,
          stream: screenStream,
        };
        // Handle stopping screen share via browser UI
        screenStream.getVideoTracks()[0].onended = () => {
          setParticipants(prev => prev.filter(p => !p.isScreenSharing));
          if (focusedParticipantId === 'screenshare') {
            setFocusedParticipantId(null);
          }
        };
        setParticipants(prev => [...prev, newScreenShare]);
        setFocusedParticipantId('screenshare');
      } catch (error) {
        console.error("Error starting screen share:", error);
        toast({
          variant: "destructive",
          title: "Screen Share Failed",
          description: "Could not start screen sharing. Please try again.",
        });
      }
    }
  };

  const setFocus = (participantId: string | null) => {
    setFocusedParticipantId(participantId);
  };

  const handleGoLive = () => {
    if (isLive) {
      // Stop streaming
      setIsLive(false);
      setActiveDestinations([]);
      toast({
        title: "Stream Ended",
        description: "You have stopped broadcasting.",
      });
    } else {
      // Open dialog to start streaming
      setGoLiveDialogOpen(true);
    }
  };
  
  const handleStartStreaming = (selectedIds: string[]) => {
    setActiveDestinations(selectedIds);
    setIsLive(true);
    setGoLiveDialogOpen(false);
    toast({
        title: "You are live!",
        description: `Successfully started streaming to ${selectedIds.length} destination(s).`,
      });
  }

  const handleDestinationsChange = (newDestinations: RtmpDestination[]) => {
    setRtmpDestinations(newDestinations);
  }

  if (hasCameraPermission === false) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background p-8">
          <Alert variant="destructive" className="max-w-lg">
            <Video className="size-4"/>
            <AlertTitle>Camera and Microphone Access Required</AlertTitle>
            <AlertDescription>
              LiveCast Studio needs access to your camera and microphone. Please enable permissions in your browser's settings and refresh the page.
            </AlertDescription>
          </Alert>
      </div>
    );
  }

  if (hasCameraPermission === null || !host) {
    return (
       <div className="flex h-screen w-full items-center justify-center bg-background">
          <p className="text-muted-foreground">Loading camera...</p>
       </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-background text-foreground font-sans">
      <main className="flex-1 flex flex-col">
        <Header>
            <SettingsDialog 
                savedDestinations={rtmpDestinations}
                onDestinationsChange={handleDestinationsChange}
            />
        </Header>
        <Scene
          participants={onStageParticipants}
          focusedParticipantId={focusedParticipantId}
          setFocus={setFocus}
          bannerText={bannerText}
          layout={layout}
        />
        <Controls
          host={host}
          toggleMute={() => toggleMute(host.id)}
          toggleCamera={() => toggleCamera(host.id)}
          toggleScreenShare={toggleScreenShare}
          isLive={isLive}
          handleGoLive={handleGoLive}
          setBannerText={setBannerText}
          isScreenSharing={!!participants.find(p => p.isScreenSharing)}
          layout={layout}
          setLayout={setLayout}
        />
      </main>
      <ParticipantsPanel
        participants={participants}
        onStageParticipants={onStageParticipants}
        setParticipants={setParticipants}
        toggleMute={toggleMute}
        toggleCamera={toggleCamera}
        setFocus={setFocus}
      />
       <GoLiveDialog 
        open={isGoLiveDialogOpen}
        onOpenChange={setGoLiveDialogOpen}
        destinations={rtmpDestinations}
        onStartStreaming={handleStartStreaming}
      />
    </div>
  );
}
