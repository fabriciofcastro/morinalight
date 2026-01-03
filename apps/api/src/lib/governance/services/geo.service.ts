export class GeoService {
    /**
     * Resolve a localização (País) baseada no IP.
     * Mock inicial para desenvolvimento. Na produção usaria MaxMind ou API externa.
     */
    static resolveCountry(ip: string): string {
        // 1. Localhost / Private IPs
        if (ip === "::1" || ip === "127.0.0.1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
            return "BR";
        }

        // 2. Mock de IP estrangeiro para testes (ex: API russa)
        if (ip.startsWith("85.114.")) {
            return "RU";
        }

        // Default seguro
        return "UNKNOWN";
    }

    static isForeignIp(ip: string, allowedCountries: string[] = ["BR"]): boolean {
        const country = this.resolveCountry(ip);
        return !allowedCountries.includes(country);
    }
}
