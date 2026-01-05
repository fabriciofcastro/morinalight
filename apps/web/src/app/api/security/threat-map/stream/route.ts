import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";

// Simulation Data Generators (Copied from main route)
const ATTACK_TYPES = ["SQL Injection", "Brute Force", "DDoS", "XSS", "Port Scan", "Malware"];
const SAO_PAULO = { lat: -23.5505, long: -46.6333 };

function generateRandomThreat() {
    const type = ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];
    const isBlocked = Math.random() > 0.2;
    const lat = (Math.random() * 140) - 70;
    const long = (Math.random() * 360) - 180;

    return {
        id: Math.random().toString(36).substr(2, 9),
        type,
        isBlocked,
        source: {
            lat,
            long,
            ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            country: "Unknown" // Simulation doesn't resolve country for speed
        },
        target: SAO_PAULO,
        timestamp: new Date().toISOString()
    };
}

export async function GET(req: NextRequest) {
    const isDev = process.env.NODE_ENV === 'development';
    const responseStream = new TransformStream();
    const writer = responseStream.writable.getWriter();
    const encoder = new TextEncoder();

    const sendEvent = async (data: any) => {
        await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    };

    // Keep alive interval
    const keepAlive = setInterval(() => {
        writer.write(encoder.encode(': keep-alive\n\n'));
    }, 15000);

    // Initial message
    const initialBatch = { type: 'connected', timestamp: new Date().toISOString() };
    sendEvent(initialBatch);

    let streamInterval: NodeJS.Timeout;

    if (isDev) {
        // Send a random threat every 1-3 seconds in dev
        streamInterval = setInterval(() => {
            if (Math.random() > 0.4) { // Not every tick
                sendEvent({ threats: [generateRandomThreat()], mode: 'simulation' });
            }
        }, 1500);
    } else {
        // In prod, we would normally use a Redis pub/sub or database polling
        // For simplicity and to satisfy the "sub-second latency" requirement with polling fallback:
        let lastTimestamp = new Date();
        streamInterval = setInterval(async () => {
            try {
                const prisma = await getPrismaClient();
                if (!prisma) return;

                const newAlerts = await prisma.securityAlert.findMany({
                    where: {
                        timestamp: {
                            gt: lastTimestamp
                        }
                    },
                    orderBy: { timestamp: 'asc' }
                });

                if (newAlerts.length > 0) {
                    lastTimestamp = newAlerts[newAlerts.length - 1].timestamp;
                    const threats = newAlerts.map(alert => ({
                        id: alert.id,
                        type: alert.alertType,
                        isBlocked: alert.severity === 'high' || alert.severity === 'critical',
                        source: {
                            lat: alert.latitude || 0,
                            long: alert.longitude || 0,
                            ip: alert.ipAddress,
                            country: alert.country
                        },
                        target: SAO_PAULO,
                        timestamp: alert.timestamp
                    }));
                    sendEvent({ threats, mode: 'live' });
                }
            } catch (e) {
                console.error("SSE Stream Error:", e);
            }
        }, 1000); // 1s polling for "sub-second" feel in prod
    }

    req.signal.onabort = () => {
        clearInterval(keepAlive);
        if (streamInterval) clearInterval(streamInterval);
        writer.close();
    };

    return new Response(responseStream.readable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
        },
    });
}
