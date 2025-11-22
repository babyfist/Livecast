'use client';

import React, { useState, useMemo, useEffect } from 'react';
import type { Participant } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Header } from './Header';
import { Scene } from './Scene';
import { Controls } from './Controls';
import { ParticipantsPanel } from './ParticipantsPanel';

const initialParticipants: Participant[] = [
  {
    id: 'host',
    name: 'Alex (Host)',
    isHost: true,
    isMuted: false,
    isCameraOn: true,
    isScreenSharing: false,
    image: PlaceHolderImages.find((p) => p.id === 'host')!,
  },
  {
    id: 'guest1',
    name: 'Maria',
    isHost: false,
    isMuted: true,
    isCameraOn: true,
    isScreenSharing: false,
    image: PlaceHolderImages.find((p) => p.id === 'guest1')!,
  },
  {
    id: 'guest2',
    name: 'David',
    isHost: false,
    isMuted: false,
    isCameraOn: false,
    isScreenSharing: false,
    image: PlaceHolderImages.find((p) => p.id === 'guest2')!,
  },
];

export function StudioLayout() {
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  const [focusedParticipantId, setFocusedParticipantId] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [bannerText, setBannerText] = useState<string>('');
  const [host, setHost] = useState(participants.find(p => p.isHost)!);

  useEffect(() => {
    setHost(participants.find(p => p.isHost)!)
  }, [participants]);

  const onStageParticipants = useMemo(
    () => participants.filter((p) => p.isCameraOn || p.isScreenSharing),
    [participants]
  );
  
  useEffect(() => {
    if (focusedParticipantId && !onStageParticipants.find(p => p.id === focusedParticipantId)) {
      setFocusedParticipantId(null);
    }
  }, [onStageParticipants, focusedParticipantId]);

  const toggleMute = (participantId: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === participantId ? { ...p, isMuted: !p.isMuted } : p))
    );
  };

  const toggleCamera = (participantId: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === participantId ? { ...p, isCameraOn: !p.isCameraOn } : p))
    );
  };
  
  const toggleScreenShare = () => {
    const screenShareParticipant = participants.find(p => p.isScreenSharing);
    if(screenShareParticipant) {
      setParticipants(prev => prev.filter(p => !p.isScreenSharing));
      if (focusedParticipantId === 'screenshare') {
        setFocusedParticipantId(null);
      }
    } else {
      const newScreenShare: Participant = {
        id: 'screenshare',
        name: 'Screen Share',
        isHost: false,
        isMuted: true,
        isCameraOn: false,
        isScreenSharing: true,
        image: PlaceHolderImages.find(p => p.id === 'screenshare')!
      };
      setParticipants(prev => [...prev, newScreenShare]);
    }
  };

  const setFocus = (participantId: string | null) => {
    setFocusedParticipantId(participantId);
  };

  const handleGoLive = () => {
    setIsLive(!isLive);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-background text-foreground font-sans">
      <main className="flex-1 flex flex-col">
        <Header />
        <Scene
          participants={onStageParticipants}
          focusedParticipantId={focusedParticipantId}
          setFocus={setFocus}
          bannerText={bannerText}
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
        />
      </main>
      <ParticipantsPanel
        participants={participants}
        setParticipants={setParticipants}
        toggleMute={toggleMute}
        toggleCamera={toggleCamera}
        setFocus={setFocus}
      />
    </div>
  );
}
