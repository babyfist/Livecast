import express from 'express';
import cors from 'cors';
import type { ChatMessage, ChatPlatform } from '../lib/types';

const app = express();
const port = 3001;

// Use cors middleware to allow requests from the Next.js app
app.use(cors({ origin: 'http://localhost:9002' }));
app.use(express.json());

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
setInterval(addRandomMessage, 5000);


// --- API Endpoints ---

// A simple endpoint to check if the server is running
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the local Node.js server!' });
});

// The new endpoint for fetching chat messages
app.get('/api/chat', (req, res) => {
  // In a real app, you would use req.query.channelIds to fetch
  // messages for specific channels from their respective APIs.
  // For now, we just return all simulated messages.
  res.json(serverSimulatedMessages);
});


app.listen(port, () => {
  console.log(`🚀 Local server listening at http://localhost:${port}`);
});
