/**
 * IP Geolocation Service
 * 
 * Tracks geographic locations of IP addresses for security analysis
 * Uses ipapi.co API with caching to reduce API calls
 */

import { getRedisClient } from '@/lib/redis/client';

export interface GeolocationData {
    ip: string;
    country: string;
    countryCode: string;
    region: string;
    city: string;
    latitude: number;
    longitude: number;
    timezone: string;
    isp?: string;
    org?: string;
    asn?: string;
}

export interface GeolocationCache {
    data: GeolocationData;
    cachedAt: Date;
}

class GeolocationService {
    private apiKey: string | undefined;
    private apiUrl = 'https://ipapi.co';
    private cacheTTL = 7 * 24 * 60 * 60; // 7 days in seconds

    constructor() {
        this.apiKey = process.env.IPAPI_API_KEY;
    }

    /**
     * Get geolocation data for an IP address
     */
    async getLocation(ip: string): Promise<GeolocationData | null> {
        // Check cache first
        const cached = await this.getCachedLocation(ip);
        if (cached) {
            return cached;
        }

        // Fetch from API
        try {
            const location = await this.fetchFromAPI(ip);
            if (location) {
                // Cache the result
                await this.cacheLocation(ip, location);
            }
            return location;
        } catch (error) {
            console.error('[Geolocation] Failed to fetch location:', error);
            return null;
        }
    }

    /**
     * Fetch location from ipapi.co API
     */
    private async fetchFromAPI(ip: string): Promise<GeolocationData | null> {
        try {
            // Skip localhost and private IPs
            if (this.isPrivateIP(ip)) {
                return {
                    ip,
                    country: 'Local',
                    countryCode: 'LOCAL',
                    region: 'Local',
                    city: 'Local',
                    latitude: 0,
                    longitude: 0,
                    timezone: 'UTC',
                };
            }

            const url = this.apiKey
                ? `${this.apiUrl}/${ip}/json/?key=${this.apiKey}`
                : `${this.apiUrl}/${ip}/json/`;

            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'MorinaLight-Security/1.0',
                },
            });

            if (!response.ok) {
                throw new Error(`API returned ${response.status}`);
            }

            const data = await response.json();

            // Check for API errors
            if (data.error) {
                console.warn('[Geolocation] API error:', data.reason);
                return null;
            }

            return {
                ip: data.ip,
                country: data.country_name || 'Unknown',
                countryCode: data.country_code || 'XX',
                region: data.region || 'Unknown',
                city: data.city || 'Unknown',
                latitude: parseFloat(data.latitude) || 0,
                longitude: parseFloat(data.longitude) || 0,
                timezone: data.timezone || 'UTC',
                isp: data.org,
                asn: data.asn,
            };
        } catch (error) {
            console.error('[Geolocation] API fetch error:', error);
            return null;
        }
    }

    /**
     * Get cached location from Redis
     */
    private async getCachedLocation(ip: string): Promise<GeolocationData | null> {
        const redis = getRedisClient();
        if (!redis) return null;

        try {
            const key = `geolocation:${ip}`;
            const cached = await redis.get(key);

            if (cached && typeof cached === 'string') {
                const parsed = JSON.parse(cached);
                return parsed.data;
            }

            return null;
        } catch (error) {
            console.error('[Geolocation] Cache read error:', error);
            return null;
        }
    }

    /**
     * Cache location data in Redis
     */
    private async cacheLocation(ip: string, data: GeolocationData): Promise<void> {
        const redis = getRedisClient();
        if (!redis) return;

        try {
            const key = `geolocation:${ip}`;
            const cacheData: GeolocationCache = {
                data,
                cachedAt: new Date(),
            };

            await redis.setex(key, this.cacheTTL, JSON.stringify(cacheData));
        } catch (error) {
            console.error('[Geolocation] Cache write error:', error);
        }
    }

    /**
     * Check if IP is private/local
     */
    private isPrivateIP(ip: string): boolean {
        if (ip === '127.0.0.1' || ip === 'localhost' || ip === '::1') {
            return true;
        }

        // Private IP ranges
        const privateRanges = [
            /^10\./,
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
            /^192\.168\./,
            /^fc00:/,
            /^fe80:/,
        ];

        return privateRanges.some(range => range.test(ip));
    }

    /**
     * Calculate distance between two coordinates (in km)
     */
    calculateDistance(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ): number {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) *
            Math.cos(this.toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Convert degrees to radians
     */
    private toRad(degrees: number): number {
        return (degrees * Math.PI) / 180;
    }

    /**
     * Detect impossible travel
     * Returns true if travel between two locations is impossible in given time
     */
    detectImpossibleTravel(
        location1: GeolocationData,
        location2: GeolocationData,
        timeDiffMinutes: number
    ): boolean {
        // Skip if same location
        if (location1.city === location2.city && location1.country === location2.country) {
            return false;
        }

        const distance = this.calculateDistance(
            location1.latitude,
            location1.longitude,
            location2.latitude,
            location2.longitude
        );

        // Assume max travel speed of 900 km/h (commercial flight)
        const maxSpeed = 900; // km/h
        const timeHours = timeDiffMinutes / 60;
        const maxDistance = maxSpeed * timeHours;

        return distance > maxDistance;
    }

    /**
     * Get location summary for display
     */
    getLocationSummary(location: GeolocationData): string {
        if (location.countryCode === 'LOCAL') {
            return 'Local Network';
        }

        const parts = [location.city, location.region, location.country].filter(Boolean);
        return parts.join(', ');
    }
}

export const geolocationService = new GeolocationService();
