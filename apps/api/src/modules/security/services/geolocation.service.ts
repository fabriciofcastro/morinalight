import { getPrisma } from "../../../infra/database/prisma.service";

const prisma = getPrisma();

export type GeoLocation = {
  ip: string;
  country: string;
  countryCode: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  isp?: string;
  isProxy?: boolean;
  isVpn?: boolean;
};

export type LocationAnomalyResult = {
  isAnomaly: boolean;
  reason?: string;
  distance?: number; // km
  timeSinceLastLogin?: number; // milliseconds
  impossibleTravel?: boolean;
};

export class GeolocationService {
  private geoipReader: any = null;

  async initialize(): Promise<void> {
    try {
      // MaxMind GeoIP2 Reader
      const maxmind = await import("@maxmind/geoip2-node");

      // Path to GeoLite2 database (download from MaxMind)
      const dbPath = process.env.GEOIP_DB_PATH || "/usr/share/GeoIP/GeoLite2-City.mmdb";

      this.geoipReader = await maxmind.Reader.open(dbPath);
      console.log("✅ [GEO] GeoIP2 database loaded successfully");
    } catch (error) {
      console.error("❌ [GEO] Failed to load GeoIP2 database:", error);
      console.warn("⚠️ [GEO] Geolocation features will be disabled");
    }
  }

  async getLocation(ip: string): Promise<GeoLocation | null> {
    if (!this.geoipReader) {
      await this.initialize();
    }

    if (!this.geoipReader) {
      return null;
    }

    try {
      const response = this.geoipReader.city(ip);

      return {
        ip,
        country: response.country?.names?.en || "Unknown",
        countryCode: response.country?.isoCode || "XX",
        city: response.city?.names?.en || "Unknown",
        latitude: response.location?.latitude || 0,
        longitude: response.location?.longitude || 0,
        timezone: response.location?.timeZone || "UTC",
        isp: response.traits?.isp,
        isProxy: response.traits?.isAnonymousProxy || false,
        isVpn: response.traits?.isAnonymousVpn || false,
      };
    } catch (error) {
      console.error(`❌ [GEO] Failed to get location for IP ${ip}:`, error);
      return null;
    }
  }

  async checkLocationAnomaly(
    userId: string,
    currentLocation: GeoLocation,
  ): Promise<LocationAnomalyResult> {
    try {
      // 1. Verificar se é proxy/VPN
      if (currentLocation.isProxy || currentLocation.isVpn) {
        return {
          isAnomaly: true,
          reason: "Login via VPN/Proxy detectado",
        };
      }

      // 2. Buscar último login do usuário
      const lastLogin = await prisma.userSession.findFirst({
        where: {
          userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          ipAddress: true,
          createdAt: true,
          location: true,
        },
      });

      if (!lastLogin || !lastLogin.location) {
        // Primeiro login ou sem histórico de localização
        return { isAnomaly: false };
      }

      const lastLocation = lastLogin.location as any;
      const timeSinceLastLogin = Date.now() - lastLogin.createdAt.getTime();

      // 3. Calcular distância entre localizações
      const distance = this.calculateDistance(
        lastLocation.latitude,
        lastLocation.longitude,
        currentLocation.latitude,
        currentLocation.longitude,
      );

      // 4. Detectar viagem impossível
      // Velocidade média de avião: ~900 km/h
      // Se a distância requer mais de 900 km/h, é impossível
      const maxPossibleDistance = (timeSinceLastLogin / (1000 * 60 * 60)) * 900; // km

      if (distance > maxPossibleDistance && distance > 100) {
        return {
          isAnomaly: true,
          reason: `Viagem impossível detectada: ${Math.round(distance)}km em ${Math.round(timeSinceLastLogin / (1000 * 60))} minutos`,
          distance,
          timeSinceLastLogin,
          impossibleTravel: true,
        };
      }

      // 5. Detectar mudança de país em menos de 1 hora
      if (
        lastLocation.countryCode !== currentLocation.countryCode &&
        timeSinceLastLogin < 60 * 60 * 1000
      ) {
        return {
          isAnomaly: true,
          reason: `Mudança de país em menos de 1 hora (${lastLocation.country} → ${currentLocation.country})`,
          distance,
          timeSinceLastLogin,
        };
      }

      // 6. Detectar distância significativa em curto período
      if (distance > 500 && timeSinceLastLogin < 2 * 60 * 60 * 1000) {
        return {
          isAnomaly: true,
          reason: `Distância significativa (${Math.round(distance)}km) em menos de 2 horas`,
          distance,
          timeSinceLastLogin,
        };
      }

      return {
        isAnomaly: false,
        distance,
        timeSinceLastLogin,
      };
    } catch (error) {
      console.error("Error checking location anomaly:", error);
      return { isAnomaly: false };
    }
  }

  /**
   * Calcula distância entre dois pontos usando fórmula de Haversine
   * @returns distância em quilômetros
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
    const distance = R * c;

    return distance;
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  async saveLocationHistory(userId: string, location: GeoLocation): Promise<void> {
    try {
      await prisma.userLocation.create({
        data: {
          userId,
          ip: location.ip,
          country: location.country,
          countryCode: location.countryCode,
          city: location.city,
          latitude: location.latitude,
          longitude: location.longitude,
          timezone: location.timezone,
          isp: location.isp,
          isProxy: location.isProxy || false,
          isVpn: location.isVpn || false,
        },
      });
    } catch (error) {
      console.error("Error saving location history:", error);
    }
  }
}

// Singleton instance
let geolocationServiceInstance: GeolocationService | null = null;

export function getGeolocationService(): GeolocationService {
  if (!geolocationServiceInstance) {
    geolocationServiceInstance = new GeolocationService();
  }
  return geolocationServiceInstance;
}
