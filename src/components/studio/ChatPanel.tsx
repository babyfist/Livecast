'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import type { ChatMessage as ChatMessageType, ChatPlatform } from '@/lib/types';
import { Separator } from '../ui/separator';


// Simulated chat messages
const simulatedMessages: ChatMessageType[] = [
  {
    id: '1',
    platform: 'youtube',
    author: { name: 'YT_User1', avatarUrl: 'https://i.pravatar.cc/150?u=yt1' },
    message: 'This is an awesome stream!',
    timestamp: new Date(Date.now() - 60000 * 5),
  },
  {
    id: '2',
    platform: 'twitch',
    author: { name: 'TwitchViewer', avatarUrl: 'https://i.pravatar.cc/150?u=twitch1' },
    message: 'PogChamp',
    timestamp: new Date(Date.now() - 60000 * 4),
  },
  {
    id: '3',
    platform: 'kick',
    author: { name: 'KickFan', avatarUrl: 'https://i.pravatar.cc/150?u=kick1' },
    message: 'Let\'s gooo! 🚀',
    timestamp: new Date(Date.now() - 60000 * 3),
  },
  {
    id: '4',
    platform: 'youtube',
    author: { name: 'Commenter', avatarUrl: 'https://i.pravatar.cc/150?u=yt2' },
    message: 'Great content, very informative.',
    timestamp: new Date(Date.now() - 60000 * 2),
  },
    {
    id: '5',
    platform: 'x',
    author: { name: 'X-User', avatarUrl: 'https://i.pravatar.cc/150?u=x1' },
    message: 'Broadcasting live from the studio!',
    timestamp: new Date(Date.now() - 60000 * 1),
  },
   {
    id: '6',
    platform: 'youtube',
    author: { name: 'NewViewer', avatarUrl: 'https://i.pravatar.cc/150?u=yt3' },
    message: 'Just joined, what did I miss?',
    timestamp: new Date(Date.now() - 60000 * 0.5),
  },
];

const PlatformIcon = ({ platform }: { platform: ChatPlatform }) => {
  switch (platform) {
    case 'youtube':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="size-4 text-red-600" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
      );
    case 'twitch':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="size-4 text-purple-600" viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0H6zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714v9.429z" /></svg>
      );
    case 'kick':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className="size-4 text-green-500" viewBox="0 0 256 256" fill="currentColor"><path d="M178.29 160H216v32h-37.71l-64-64 64-64H216V0h-37.71l-64 64 22.63 22.63L178.29 48H200v16h-21.71l-32 32 32 32H200v16h-21.71l-42.34-42.34L74.34 34.34 34.34 74.34 76.69 116.69 40 153.34V128H24v28.69L0 178.69v34.62L34.69 256h34.62l22-22-32-32 28.69-28.69Z"/></svg>
        );
    case 'x':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        );
    default:
      return null;
  }
};


const ChatMessage = ({ msg }: { msg: ChatMessageType }) => (
  <div className="flex items-start gap-3 text-sm">
    <Avatar className="size-8">
      <AvatarImage src={msg.author.avatarUrl} />
      <AvatarFallback>{msg.author.name.charAt(0)}</AvatarFallback>
    </Avatar>
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <span className="font-semibold">{msg.author.name}</span>
        <PlatformIcon platform={msg.platform} />
        <span className="text-xs text-muted-foreground">
          {msg.timestamp.toLocaleTimeString()}
        </span>
      </div>
      <p className="text-muted-foreground">{msg.message}</p>
    </div>
  </div>
);

const ChatTabContent = ({ messages, platform }: { messages: ChatMessageType[], platform: ChatPlatform | 'all' }) => {
    const filteredMessages = platform === 'all' ? messages : messages.filter(m => m.platform === platform);
    return (
        <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
                {filteredMessages.length > 0 ? (
                    filteredMessages.map(msg => <ChatMessage key={msg.id} msg={msg} />)
                ) : (
                    <div className="text-center text-muted-foreground py-10">No messages yet.</div>
                )}
            </div>
        </ScrollArea>
    )
};


export function ChatPanel() {

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Tabs defaultValue="all" className="flex-1 flex flex-col min-h-0">
         <div className="p-4 border-b border-border/50">
            <h2 className="font-semibold">Live Chat</h2>
        </div>
        <TabsList className="px-4 border-b border-border/50 justify-start rounded-none bg-transparent">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="youtube"><PlatformIcon platform="youtube" /></TabsTrigger>
            <TabsTrigger value="twitch"><PlatformIcon platform="twitch" /></TabsTrigger>
            <TabsTrigger value="kick"><PlatformIcon platform="kick" /></TabsTrigger>
            <TabsTrigger value="x"><PlatformIcon platform="x" /></TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="flex-1 flex flex-col min-h-0 mt-0">
            <ChatTabContent messages={simulatedMessages} platform="all" />
        </TabsContent>
        <TabsContent value="youtube" className="flex-1 flex flex-col min-h-0 mt-0">
            <ChatTabContent messages={simulatedMessages} platform="youtube" />
        </TabsContent>
        <TabsContent value="twitch" className="flex-1 flex flex-col min-h-0 mt-0">
            <ChatTabContent messages={simulatedMessages} platform="twitch" />
        </TabsContent>
        <TabsContent value="kick" className="flex-1 flex flex-col min-h-0 mt-0">
            <ChatTabContent messages={simulatedMessages} platform="kick" />
        </TabsContent>
        <TabsContent value="x" className="flex-1 flex flex-col min-h-0 mt-0">
            <ChatTabContent messages={simulatedMessages} platform="x" />
        </TabsContent>
      </Tabs>
      <Separator />
      <div className="p-4">
        <div className="flex gap-2">
            <Input placeholder="Send a message..." />
            <Button><Send className="size-4" /></Button>
        </div>
      </div>
    </div>
  );
}
