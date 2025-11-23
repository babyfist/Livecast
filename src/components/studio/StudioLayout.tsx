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
import { MessagesSquare, Users, Video } from 'lucide-react';
import { GoLiveDialog } from './GoLiveDialog';
import { SettingsDialog } from './SettingsDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChatPanel } from './ChatPanel';


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
  const [activeDestinations, setActiveDestinations] = useState<RtmpDestination[]>([]);


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
                name: 'Alex Johnson',
                isHost: false,
                isMuted: true,
                isCameraOn: true,
                isScreenSharing: false,
                image: PlaceHolderImages.find(p => p.id === 'guest1')!,
                stream: undefined
            },
            {
                id: 'guest2',
                name: 'Samira Chen',
                isHost: false,
                isMuted: true,
                isCameraOn: false,
                isScreenSharing: false,
                image: PlaceHolderImages.find(p => p.id === 'guest2')!,
                stream: undefined
            },
            {
                id: 'guest3',
                name: 'Kenji Tanaka',
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
    () => participants.filter((p) => (p.isCameraOn) || p.isScreenSharing),
    [participants]
  );
  
  useEffect(() => {
    // If a manually focused participant leaves the stage, unfocus them
    if (focusedParticipantId && layout !== 'focus' && !onStageParticipants.find(p => p.id === focusedParticipantId)) {
      setFocusedParticipantId(null);
    }
  }, [onStageParticipants, focusedParticipantId, layout]);

  useEffect(() => {
    // When switching to a grid/circle layout, clear any manual focus.
    // When switching to focus layout, also clear manual focus to let auto-focus take over.
    if (layout === 'grid' || layout === 'circle' || layout === 'focus') {
      setFocusedParticipantId(null);
    }
  }, [layout]);


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
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        const newScreenShare: Participant = {
          id: 'screenshare',
          name: 'Screen Share',
          isHost: false,
          isMuted: true,
          isCameraOn: true, // Treat as on to get it on stage
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
        setLayout('focus');
      } catch (error: any) {
        if (error.name === 'NotAllowedError' || error.name === 'NotFoundError') {
          console.log('Screen share cancelled by user.');
        } else {
            console.error("Error starting screen share:", error);
            toast({
              variant: "destructive",
              title: "Screen Share Failed",
              description: "Could not start screen sharing. Please try again.",
            });
        }
      }
    }
  };

  const setFocus = (participantId: string | null) => {
    if (layout !== 'focus') {
        setFocusedParticipantId(participantId);
    }
  };

  const handleGoLive = async () => {
    if (isLive) {
      // Stop streaming
      try {
        await fetch('/api/broadcast/stop', { method: 'POST' });
        setIsLive(false);
        setActiveDestinations([]);
        toast({
          title: "Stream Ended",
          description: "You have stopped broadcasting.",
        });
      } catch (error) {
        console.error("Failed to stop broadcast:", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not stop the broadcast. Please check the server.',
        });
      }
    } else {
      // Open dialog to start streaming
      setGoLiveDialogOpen(true);
    }
  };
  
  const handleStartStreaming = async (selectedIds: string[]) => {
    const selectedDestinations = rtmpDestinations.filter(d => selectedIds.includes(d.id));
    try {
        await fetch('/api/broadcast/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ destinations: selectedDestinations }),
        });

        setActiveDestinations(selectedDestinations);
        setIsLive(true);
        setGoLiveDialogOpen(false);
        toast({
            title: "You are live!",
            description: `Successfully started streaming to ${selectedIds.length} destination(s).`,
        });

    } catch (error) {
        console.error("Failed to start broadcast:", error);
        toast({
            variant: 'destructive',
            title: 'Broadcast Error',
            description: 'Could not start the stream. Check the local server connection.',
        });
    }
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
      <main className="flex-1 flex flex-col min-h-0">
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

      <aside className="w-full lg:w-80 bg-card/50 border-l border-border/50 flex flex-col h-full lg:max-h-screen">
        <Tabs defaultValue="participants" className="flex flex-col flex-1 min-h-0">
            <TabsList className="grid w-full grid-cols-2 rounded-none shrink-0">
                <TabsTrigger value="participants">
                    <Users className="mr-2 size-4" />
                    Participants
                </TabsTrigger>
                <TabsTrigger value="chat">
                    <MessagesSquare className="mr-2 size-4" />
                    Chat
                </TabsTrigger>
            </TabsList>
            <TabsContent value="participants" className="flex-1 flex flex-col min-h-0">
                <ParticipantsPanel
                    participants={participants}
                    onStageParticipants={onStageParticipants}
                    setParticipants={setParticipants}
                    toggleMute={toggleMute}
                    toggleCamera={toggleCamera}
                    setFocus={setFocus}
                />
            </TabsContent>
            <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 mt-0">
                <ChatPanel activeDestinations={activeDestinations} />
            </TabsContent>
        </Tabs>
      </aside>

       <GoLiveDialog 
        open={isGoLiveDialogOpen}
        onOpenChange={setGoLiveDialogOpen}
        destinations={rtmpDestinations}
        onStartStreaming={handleStartStreaming}
      />
    </div>
  );
}
