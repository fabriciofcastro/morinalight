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
                    userAgent: components.userAgent.value,
                    language: components.languages.value[0] || 'unknown',
                    colorDepth: components.colorDepth.value,
                    deviceMemory: components.deviceMemory?.value,
                    hardwareConcurrency: components.hardwareConcurrency?.value,
                    screenResolution: `${components.screenResolution.value[0]}x${components.screenResolution.value[1]}`,
                    availableScreenResolution: `${components.availableScreenResolution.value[0]}x${components.availableScreenResolution.value[1]}`,
                    timezoneOffset: components.timezoneOffset.value,
                    timezone: components.timezone.value,
                    sessionStorage: components.sessionStorage.value,
                    localStorage: components.localStorage.value,
                    indexedDB: components.indexedDb.value,
                    platform: components.platform.value,
                    plugins: components.plugins.value.map((p: any) => p.name),
                    canvas: components.canvas?.value,
                    webgl: components.webgl?.value,
                    fonts: components.fonts?.value || [],
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
                userAgent: components.userAgent.value,
                language: components.languages.value[0] || 'unknown',
                colorDepth: components.colorDepth.value,
                deviceMemory: components.deviceMemory?.value,
                hardwareConcurrency: components.hardwareConcurrency?.value,
                screenResolution: `${components.screenResolution.value[0]}x${components.screenResolution.value[1]}`,
                availableScreenResolution: `${components.availableScreenResolution.value[0]}x${components.availableScreenResolution.value[1]}`,
                timezoneOffset: components.timezoneOffset.value,
                timezone: components.timezone.value,
                sessionStorage: components.sessionStorage.value,
                localStorage: components.localStorage.value,
                indexedDB: components.indexedDb.value,
                platform: components.platform.value,
                plugins: components.plugins.value.map((p: any) => p.name),
                canvas: components.canvas?.value,
                webgl: components.webgl?.value,
                fonts: components.fonts?.value || [],
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
