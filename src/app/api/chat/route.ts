import { NextResponse } from 'next/server';
import type { ChatMessage, ChatPlatform } from '@/lib/types';

// --- In-memory simulated chat store ---

let messageIdCounter = 0;
const serverSimulatedMessages: ChatMessage[] = [];
const authors = [
  { name: 'Alice', avatarUrl: 'https://i.pravatar.cc/150?u=alice' },
  { name: 'Bob', avatarUrl: 'https://i.pravatar.cc/150?u=bob' },
  { name: 'Charlie', avatarUrl: 'https://i.pravatar.cc/150?u=charlie' },
  { name: 'Diana', avatarUrl: 'https://i.pravatar.cc/150?u=diana' },
];
const platforms: ChatPlatform[] = ['youtube', 'twitch', 'kick', 'x'];
const possibleMessages = [
  'This stream is amazing!',
  'Can you show the code for that last part again?',
  'Hello from Germany! 👋',
  'What tech stack are you using?',
  'This is my first time here, what is this stream about?',
  '🚀🚀🚀',
  'Can you explain that concept in a different way?',
  'This is so helpful, thank you!',
];

// Function to add a new random message
const addRandomMessage = () => {
  const author = authors[Math.floor(Math.random() * authors.length)];
  const platform = platforms[Math.floor(Math.random() * platforms.length)];
  const message = possibleMessages[Math.floor(Math.random() * possibleMessages.length)];

  serverSimulatedMessages.push({
    id: `msg-${messageIdCounter++}`,
    platform,
    author,
    message,
    timestamp: new Date(),
  });
  
  // Keep the list from growing indefinitely
  if (serverSimulatedMessages.length > 50) {
    serverSimulatedMessages.shift();
  }
};

// Add a new message every few seconds to simulate a live chat
// This will only run once when the server module is first loaded.
if (process.env.NODE_ENV === 'development') {
    if (global.chatInterval) {
        clearInterval(global.chatInterval);
    }
    global.chatInterval = setInterval(addRandomMessage, 5000);
}


export async function GET(request: Request) {
  // In a real app, you would use the searchParams to fetch
  // messages for specific channels from their respective APIs.
  // For now, we just return all simulated messages.
  return NextResponse.json(serverSimulatedMessages);
}

// Extend the global type to keep track of the interval in development
declare global {
  var chatInterval: NodeJS.Timeout | undefined;
}
