import type { ImagePlaceholder } from './placeholder-images';

export type Participant = {
  id: string;
  name: string;
  isHost: boolean;
  isMuted: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  image: ImagePlaceholder;
  stream?: MediaStream;
};

export type LayoutMode = 'grid' | 'circle' | 'focus';

export type RtmpDestination = {
    id: string;
    name: string;
    url: string;
    key: string;
};

export type ChatPlatform = 'youtube' | 'twitch' | 'kick' | 'x';

export type ChatMessage = {
  id: string;
  platform: ChatPlatform;
  author: {
    name: string;
    avatarUrl?: string;
  };
  message: string;
  timestamp: Date;
};
