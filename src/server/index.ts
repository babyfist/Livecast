import express from 'express';
import cors from 'cors';
import http from 'http';
import ffmpeg from 'fluent-ffmpeg';
import type { RtmpDestination } from '@/lib/types';
import { spawn } from 'child_process';


const app = express();
const port = 3001;

app.use(cors()); // Use default CORS settings (allow all)
app.use(express.json()); // Middleware to parse JSON bodies

// --- In-memory state ---
let ffmpegProcess: ReturnType<typeof spawn> | null = null;

// --- API Endpoints ---

/**
 * Endpoint to start the FFmpeg broadcast.
 * This is a simplified example. A real-world app would need more robust handling
 * for different media inputs, layouts, and error conditions.
 */
app.post('/api/broadcast/start', (req, res) => {
    if (ffmpegProcess) {
        return res.status(400).json({ message: 'Broadcast is already running.' });
    }

    const { destinations } = req.body as { destinations: RtmpDestination[] };
    if (!destinations || destinations.length === 0) {
        return res.status(400).json({ message: 'No destinations provided.' });
    }

    console.log(`🎬 Received request to start broadcast to: ${destinations.map(d => d.name).join(', ')}`);

    // This example uses a test pattern. A real implementation would need to
    // capture the browser's MediaStream, likely via WebRTC, and pipe it to FFmpeg.
    // That is a highly complex task and is beyond the scope of this example.
    const input = 'smptehdbars'; // SMPTE HD color bars
    const inputOptions = [
        '-f lavfi', // libavfilter virtual device
        '-re',      // Read input at native frame rate
    ];

    try {
        const command = ffmpeg(input, { timeout: 432000, logger: console });
        command.inputOptions(inputOptions);

        destinations.forEach(dest => {
            const rtmpUrl = `${dest.url}/${dest.key}`;
            command
                .addOutput(rtmpUrl)
                .outputOptions([
                    '-c:v libx264',
                    '-preset veryfast',
                    '-tune zerolatency',
                    '-b:v 2500k',
                    '-maxrate 2500k',
                    '-bufsize 5000k',
                    '-g 50',
                    '-c:a aac',
                    '-b:a 128k',
                    '-ar 44100',
                    '-f flv'
                ]);
        });
        
        command
            .on('start', (commandLine) => {
                console.log('FFmpeg started with command: ' + commandLine);
                // We are using spawn directly instead of command.run() to have more control
                // over the process handle for graceful shutdown.
            })
            .on('error', (err, stdout, stderr) => {
                console.error('FFmpeg error: ', err.message);
                console.error('FFmpeg stderr: ', stderr);
                // Clean up on error
                if (ffmpegProcess) {
                    ffmpegProcess.kill('SIGKILL');
                    ffmpegProcess = null;
                }
            })
            .on('end', () => {
                console.log('FFmpeg process finished.');
                ffmpegProcess = null;
            });
        
        // Due to limitations in fluent-ffmpeg's process management,
        // we'll use its internal method to spawn but keep the handle.
        // @ts-ignore - _spawn is a private method but we need access to the process
        ffmpegProcess = command._spawn();

        res.json({ message: `Broadcast started to ${destinations.length} destination(s).` });

    } catch (error: any) {
        console.error('Failed to start FFmpeg:', error);
        res.status(500).json({ message: 'Failed to start FFmpeg process.', details: error.message });
    }
});


/**
 * Endpoint to stop the FFmpeg broadcast.
 */
app.post('/api/broadcast/stop', (req, res) => {
    console.log('🛑 Received request to stop broadcast.');

    if (ffmpegProcess) {
        // Send SIGINT for a graceful shutdown, allowing FFmpeg to finalize the stream
        ffmpegProcess.kill('SIGINT');
        ffmpegProcess = null;
        console.log('FFmpeg process termination signal sent.');
        res.json({ message: 'Broadcast stopping.' });
    } else {
        console.log('No active broadcast to stop.');
        res.status(400).json({ message: 'No active broadcast to stop.' });
    }
});

const server = http.createServer(app);

server.listen(port, () => {
    console.log(`🚀 Local server listening at http://localhost:${port}`);
});
