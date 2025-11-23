import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    console.log(`🛑 Received request to stop broadcast.`);
    
    // In a real app, this is where you would terminate the RTMP stream(s).
    
    return NextResponse.json({ message: 'Simulating broadcast stop.' });
}
