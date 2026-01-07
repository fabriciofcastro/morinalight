'use client';

import { useEffect, useState } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

/**
 * Informações do dispositivo
 */
export interface DeviceFingerprint {
    visitorId: string;
    confidence: number;
    components: {
        userAgent: string;
        language: string;
        colorDepth: number;
        deviceMemory?: number;
        hardwareConcurrency?: number;
        screenResolution: string;
        availableScreenResolution: string;
        timezoneOffset: number;
        timezone: string;
        sessionStorage: boolean;
        localStorage: boolean;
        indexedDB: boolean;
        platform: string;
        plugins: string[];
        canvas?: string;
        webgl?: string;
        fonts: string[];
    };
}

/**
 * Hook para fingerprinting de dispositivo
 */
export function useDeviceFingerprint() {
    const [fingerprint, setFingerprint] = useState<DeviceFingerprint | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        generateFingerprint();
    }, []);

    const generateFingerprint = async () => {
        try {
            setLoading(true);

            // Carrega FingerprintJS
            const fp = await FingerprintJS.load();

            // Gera fingerprint
            const result = await fp.get();

            // Extrai componentes
            const components = result.components;

            const deviceFingerprint: DeviceFingerprint = {
                visitorId: result.visitorId,
                confidence: result.confidence.score,
                components: {
                    userAgent: (components.platform as any)?.value || 'unknown',
                    language: (components.languages as any)?.value?.[0]?.[0] || 'unknown',
                    colorDepth: (components.colorDepth as any)?.value || 0,
                    deviceMemory: (components.deviceMemory as any)?.value,
                    hardwareConcurrency: (components.hardwareConcurrency as any)?.value,
                    screenResolution: (components.screenResolution as any)?.value ? `${(components.screenResolution as any).value[0]}x${(components.screenResolution as any).value[1]}` : 'unknown',
                    availableScreenResolution: 'unknown',
                    timezoneOffset: (components as any).timezoneOffset?.value || 0,
                    timezone: (components as any).timezone?.value || 'unknown',
                    sessionStorage: (components as any).sessionStorage?.value || false,
                    localStorage: (components as any).localStorage?.value || false,
                    indexedDB: (components as any).indexedDB?.value || false,
                    platform: (components as any).platform?.value || 'unknown',
                    plugins: (components as any).plugins?.value?.map((p: any) => p.name) || [],
                    canvas: (components as any).canvas?.value || '',
                    webgl: (components as any).webgl?.value || '',
                    fonts: (components as any).fonts?.value || [],
                },
            };

            setFingerprint(deviceFingerprint);
            setError(null);
        } catch (err) {
            console.error('[Fingerprint] Erro ao gerar:', err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    return {
        fingerprint,
        loading,
        error,
        regenerate: generateFingerprint,
    };
}

/**
 * Serviço de fingerprinting (uso direto)
 */
export class DeviceFingerprintService {
    private static instance: DeviceFingerprintService;
    private fp: any = null;

    private constructor() { }

    static getInstance(): DeviceFingerprintService {
        if (!DeviceFingerprintService.instance) {
            DeviceFingerprintService.instance = new DeviceFingerprintService();
        }
        return DeviceFingerprintService.instance;
    }

    /**
     * Inicializa o serviço
     */
    async initialize() {
        if (!this.fp) {
            this.fp = await FingerprintJS.load();
        }
    }

    /**
     * Obtém fingerprint do dispositivo
     */
    async getFingerprint(): Promise<string> {
        await this.initialize();
        const result = await this.fp.get();
        return result.visitorId;
    }

    /**
     * Obtém fingerprint completo
     */
    async getFullFingerprint(): Promise<DeviceFingerprint> {
        await this.initialize();
        const result = await this.fp.get();
        const components = result.components;

        return {
            visitorId: result.visitorId,
            confidence: result.confidence.score,
            components: {
                userAgent: (components.platform as any)?.value || 'unknown',
                language: (components.languages as any)?.value?.[0]?.[0] || 'unknown',
                colorDepth: (components.colorDepth as any)?.value || 0,
                deviceMemory: (components.deviceMemory as any)?.value,
                hardwareConcurrency: (components.hardwareConcurrency as any)?.value,
                screenResolution: (components.screenResolution as any)?.value ? `${(components.screenResolution as any).value[0]}x${(components.screenResolution as any).value[1]}` : 'unknown',
                availableScreenResolution: 'unknown', // Removed in recent versions or different name
                timezoneOffset: (components.timezoneOffset as any)?.value || 0,
                timezone: (components.timezone as any)?.value || 'unknown',
                sessionStorage: (components.sessionStorage as any)?.value || false,
                localStorage: (components.localStorage as any)?.value || false,
                indexedDB: (components.indexedDB as any)?.value || false,
                platform: (components.platform as any)?.value || 'unknown',
                plugins: (components.plugins as any)?.value?.map((p: any) => p.name) || [],
                canvas: (components.canvas as any)?.value || '',
                webgl: (components.webgl as any)?.value || '',
                fonts: (components.fonts as any)?.value || [],
            },
        };
    }

    /**
     * Verifica se dispositivo é conhecido
     */
    async isKnownDevice(knownDeviceIds: string[]): Promise<boolean> {
        const deviceId = await this.getFingerprint();
        return knownDeviceIds.includes(deviceId);
    }

    /**
     * Obtém informações do navegador
     */
    getBrowserInfo(): {
        userAgent: string;
        language: string;
        platform: string;
        cookieEnabled: boolean;
        doNotTrack: string | null;
    } {
        return {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            doNotTrack: (navigator as any).doNotTrack || null,
        };
    }

    /**
     * Obtém informações da tela
     */
    getScreenInfo(): {
        width: number;
        height: number;
        availWidth: number;
        availHeight: number;
        colorDepth: number;
        pixelDepth: number;
    } {
        return {
            width: screen.width,
            height: screen.height,
            availWidth: screen.availWidth,
            availHeight: screen.availHeight,
            colorDepth: screen.colorDepth,
            pixelDepth: screen.pixelDepth,
        };
    }
}
