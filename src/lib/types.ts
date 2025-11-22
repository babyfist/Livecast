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

export type LayoutMode = 'grid' | 'circle';
