import { NextResponse } from "next/server";
import { getAuthHeadersWithTenant } from "@/lib/auth-client";
import { getPrismaClient } from "@/lib/prisma";
import { GeoIPService } from "@/lib/security/geoip-service";

// Simulation Data Generators
const ATTACK_TYPES = ["SQL Injection", "Brute Force", "DDoS", "XSS", "Port Scan", "Malware"];
const CONTINENTS = {
    NA: { lat: 40, long: -100 },
    SA: { lat: -20, long: -60 },
    EU: { lat: 50, long: 10 },
    AS: { lat: 30, long: 100 },
    AF: { lat: 0, long: 20 },
    OC: { lat: -25, long: 135 }
};

function generateRandomThreat() {
    const type = ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];
    const isBlocked = Math.random() > 0.2; // 80% blocked

    // Random Lat/Long (very rough approximation to land masses)
    const lat = (Math.random() * 140) - 70;
    const long = (Math.random() * 360) - 180;

    return {
        id: Math.random().toString(36).substr(2, 9),
        type,
        isBlocked,
        source: {
            lat,
            long,
            ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
        },
        target: {
            lat: -23.5505, // Sao Paulo (Datacenter default)
            long: -46.6333
        },
        timestamp: new Date().toISOString()
    };
}

export async function GET(request: Request) {
    try {
        const isDev = process.env.NODE_ENV === 'development';

        // In dev, return 5-10 random threats
        if (isDev) {
            const threats = Array.from({ length: Math.floor(Math.random() * 5) + 3 }).map(generateRandomThreat);
            return NextResponse.json({ threats, mode: 'simulation' });
        }

        const prisma = await getPrismaClient();
        if (!prisma) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
        }

        // In prod, fetch real alerts from DB
        // Fetch last 50 alerts from last 1 hour
        const alerts = await prisma.securityAlert.findMany({
            where: {
                timestamp: {
                    gt: new Date(Date.now() - 60 * 60 * 1000) // Last hour
                }
            },
            orderBy: { timestamp: 'desc' },
            take: 50
        });

        const threats = alerts.map(alert => ({
            id: alert.id,
            type: alert.alertType,
            isBlocked: alert.severity === 'high' || alert.severity === 'critical', // Assumption
            source: {
                lat: alert.latitude || 0,
                long: alert.longitude || 0,
                ip: alert.ipAddress,
                country: alert.country
            },
            target: {
                lat: -23.5505, // Sao Paulo
                long: -46.6333
            },
            timestamp: alert.timestamp
        }));

        return NextResponse.json({ threats, mode: 'live' });

    } catch (error) {
        console.error("Threat Map API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
