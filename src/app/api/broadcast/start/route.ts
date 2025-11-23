import { NextResponse } from 'next/server';
import type { RtmpDestination } from '@/lib/types';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { destinations } = body as { destinations: RtmpDestination[] };
        
        if (!destinations || destinations.length === 0) {
            return NextResponse.json({ message: 'No destinations provided.' }, { status: 400 });
        }

        const destinationNames = destinations.map(d => d.name).join(', ');
        console.log(`🎬 Received request to start broadcast to: ${destinationNames}`);
        
        // In a real app, this is where you would initiate the RTMP stream(s)
        // using a tool like FFMPEG.
        
        return NextResponse.json({ message: `Simulating broadcast start to ${destinationNames}` });

    } catch (error) {
        console.error('Error parsing request body:', error);
        return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
    }
}
