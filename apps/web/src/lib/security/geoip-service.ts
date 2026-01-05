
import geoip from 'geoip-lite';

export interface GeoLocation {
    range: [number, number];
    country: string;
    region: string;
    eu: string;
    timezone: string;
    city: string;
    ll: [number, number];
    metro: number;
    area: number;
}

export class GeoIPService {
    /**
     * Resolve um endereço IP para sua localização geográfica.
     * @param ip Endereço IP (IPv4 ou IPv6)
     * @returns Objeto GeoLocation ou null se não encontrado ou IP for privado/localhost
     */
    static lookup(ip: string): GeoLocation | null {
        // Ignorar localhost e IPs privados comuns para evitar lookups desnecessários
        if (
            ip === '127.0.0.1' ||
            ip === '::1' ||
            ip.startsWith('192.168.') ||
            ip.startsWith('10.')
        ) {
            return null;
        }

        const geo = geoip.lookup(ip);
        return geo;
    }

    /**
     * Retorna apenas Lat/Long para visualização em mapas
     */
    static getCoordinates(ip: string): [number, number] | null {
        const geo = this.lookup(ip);
        return geo ? geo.ll : null;
    }
}
