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

export type ChatPlatform = 'youtube' | 'twitch' | 'kick' | 'x';

export type RtmpDestination = {
    id: string;
    name: string;
    url: string;
    key: string;
    platform: ChatPlatform;
    channelId: string;
};

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
