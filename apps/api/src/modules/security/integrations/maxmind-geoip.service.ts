import Reader from "@maxmind/geoip2-node";

/**
 * Informações de geolocalização
 */
export interface GeoLocation {
  country: string;
  countryName: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  postalCode?: string;
  isEu?: boolean;
}

/**
 * MaxMindGeoIPService
 * Serviço de geolocalização usando MaxMind GeoIP2
 */
export class MaxMindGeoIPService {
  private reader: Reader | null = null;
  private initialized = false;

  constructor() {
    this.initialize();
  }

  /**
   * Inicializa o leitor do banco de dados MaxMind
   */
  private async initialize() {
    try {
      const dbPath = process.env.MAXMIND_DB_PATH || "./data/GeoLite2-City.mmdb";

      // Verifica se o arquivo existe
      const fs = require("fs");
      if (!fs.existsSync(dbPath)) {
        console.warn(`[MaxMind] Banco de dados não encontrado em ${dbPath}`);
        console.warn(
          "[MaxMind] Baixe em: https://dev.maxmind.com/geoip/geolite2-free-geolocation-data",
        );
        return;
      }

      this.reader = await Reader.open(dbPath);
      this.initialized = true;
      console.log("[MaxMind] Serviço inicializado com sucesso");
    } catch (error) {
      console.error("[MaxMind] Erro ao inicializar:", error);
    }
  }

  /**
   * Obtém geolocalização por IP
   */
  async getLocation(ipAddress: string): Promise<GeoLocation | null> {
    if (!this.initialized || !this.reader) {
      console.warn("[MaxMind] Serviço não inicializado, retornando null");
      return null;
    }

    try {
      const response = this.reader.city(ipAddress);

      return {
        country: response.country?.isoCode || "UNKNOWN",
        countryName: response.country?.names?.en || "Unknown",
        city: response.city?.names?.en,
        region: response.subdivisions?.[0]?.names?.en,
        latitude: response.location?.latitude,
        longitude: response.location?.longitude,
        timezone: response.location?.timeZone,
        postalCode: response.postal?.code,
        isEu: response.country?.isInEuropeanUnion,
      };
    } catch (error) {
      console.error(`[MaxMind] Erro ao buscar localização para IP ${ipAddress}:`, error);
      return null;
    }
  }

  /**
   * Verifica se IP é de um país específico
   */
  async isFromCountry(ipAddress: string, countryCode: string): Promise<boolean> {
    const location = await this.getLocation(ipAddress);
    return location?.country === countryCode;
  }

  /**
   * Verifica se IP é da União Europeia
   */
  async isFromEU(ipAddress: string): Promise<boolean> {
    const location = await this.getLocation(ipAddress);
    return location?.isEu || false;
  }

  /**
   * Obtém apenas o país
   */
  async getCountry(ipAddress: string): Promise<string | null> {
    const location = await this.getLocation(ipAddress);
    return location?.country || null;
  }

  /**
   * Obtém apenas a cidade
   */
  async getCity(ipAddress: string): Promise<string | null> {
    const location = await this.getLocation(ipAddress);
    return location?.city || null;
  }

  /**
   * Calcula distância entre duas coordenadas (em km)
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Raio da Terra em km
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

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Verifica se houve viagem impossível (acesso de locais muito distantes em pouco tempo)
   */
  async detectImpossibleTravel(
    ip1: string,
    ip2: string,
    timeDiffMinutes: number,
  ): Promise<boolean> {
    const loc1 = await this.getLocation(ip1);
    const loc2 = await this.getLocation(ip2);

    if (!loc1?.latitude || !loc2?.latitude) {
      return false;
    }

    const distance = this.calculateDistance(
      loc1.latitude,
      loc1.longitude!,
      loc2.latitude,
      loc2.longitude!,
    );

    // Velocidade máxima possível: 900 km/h (avião comercial)
    const maxPossibleDistance = (900 / 60) * timeDiffMinutes;

    return distance > maxPossibleDistance;
  }
}
