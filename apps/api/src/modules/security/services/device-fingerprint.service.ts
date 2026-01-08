import { getPrisma } from "../../../infra/database/prisma.service";

const prisma = getPrisma();

export type DeviceFingerprint = {
  visitorId: string;
  confidence: number;
  userAgent: string;
  screen: {
    width: number;
    height: number;
  };
  timezone: string;
  language: string;
  platform: string;
};

export type DeviceAnomalyResult = {
  isNewDevice: boolean;
  isKnownDevice: boolean;
  isSuspicious: boolean;
  reason?: string;
  deviceCount: number;
};

export class DeviceFingerprintService {
  async registerDevice(userId: string, fingerprint: DeviceFingerprint, ip: string): Promise<void> {
    try {
      // Verificar se dispositivo já existe
      const existing = await prisma.userDevice.findFirst({
        where: {
          userId,
          fingerprintId: fingerprint.visitorId,
        },
      });

      if (existing) {
        // Atualizar última vez visto
        await prisma.userDevice.update({
          where: { id: existing.id },
          data: {
            lastSeenAt: new Date(),
            lastSeenIp: ip,
            accessCount: { increment: 1 },
          },
        });
      } else {
        // Registrar novo dispositivo
        await prisma.userDevice.create({
          data: {
            userId,
            fingerprintId: fingerprint.visitorId,
            userAgent: fingerprint.userAgent,
            screenWidth: fingerprint.screen.width,
            screenHeight: fingerprint.screen.height,
            timezone: fingerprint.timezone,
            language: fingerprint.language,
            platform: fingerprint.platform,
            confidence: fingerprint.confidence,
            firstSeenAt: new Date(),
            lastSeenAt: new Date(),
            lastSeenIp: ip,
            accessCount: 1,
            trusted: false, // Novo dispositivo não é confiável por padrão
          },
        });

        console.log(`📱 [DEVICE] Novo dispositivo registrado para usuário ${userId}`);
      }
    } catch (error) {
      console.error("Error registering device:", error);
    }
  }

  async checkDeviceAnomaly(
    userId: string,
    fingerprint: DeviceFingerprint,
  ): Promise<DeviceAnomalyResult> {
    try {
      // Buscar dispositivos conhecidos do usuário
      const knownDevices = await prisma.userDevice.findMany({
        where: { userId },
        orderBy: { lastSeenAt: "desc" },
      });

      const isKnownDevice = knownDevices.some((d) => d.fingerprintId === fingerprint.visitorId);
      const isNewDevice = !isKnownDevice;
      const deviceCount = knownDevices.length;

      // Heurísticas de suspeita
      let isSuspicious = false;
      let reason: string | undefined;

      // 1. Muitos dispositivos (> 5)
      if (deviceCount >= 5 && isNewDevice) {
        isSuspicious = true;
        reason = `Usuário possui ${deviceCount} dispositivos registrados`;
      }

      // 2. Confidence score baixo (< 0.5)
      if (fingerprint.confidence < 0.5) {
        isSuspicious = true;
        reason = reason
          ? `${reason}; Confidence score baixo (${fingerprint.confidence})`
          : `Confidence score baixo (${fingerprint.confidence})`;
      }

      // 3. User-Agent suspeito (bots)
      const suspiciousAgents = ["bot", "crawler", "spider", "scraper", "curl", "wget"];
      if (suspiciousAgents.some((agent) => fingerprint.userAgent.toLowerCase().includes(agent))) {
        isSuspicious = true;
        reason = reason ? `${reason}; User-Agent suspeito` : "User-Agent suspeito";
      }

      return {
        isNewDevice,
        isKnownDevice,
        isSuspicious,
        reason,
        deviceCount,
      };
    } catch (error) {
      console.error("Error checking device anomaly:", error);
      return {
        isNewDevice: false,
        isKnownDevice: false,
        isSuspicious: false,
        deviceCount: 0,
      };
    }
  }

  async getTrustedDevices(userId: string): Promise<any[]> {
    try {
      return await prisma.userDevice.findMany({
        where: {
          userId,
          trusted: true,
        },
        orderBy: { lastSeenAt: "desc" },
      });
    } catch (error) {
      console.error("Error getting trusted devices:", error);
      return [];
    }
  }

  async trustDevice(userId: string, fingerprintId: string): Promise<void> {
    try {
      await prisma.userDevice.updateMany({
        where: {
          userId,
          fingerprintId,
        },
        data: {
          trusted: true,
        },
      });

      console.log(`✅ [DEVICE] Dispositivo ${fingerprintId} marcado como confiável`);
    } catch (error) {
      console.error("Error trusting device:", error);
    }
  }

  async revokeDevice(userId: string, fingerprintId: string): Promise<void> {
    try {
      await prisma.userDevice.deleteMany({
        where: {
          userId,
          fingerprintId,
        },
      });

      console.log(`🗑️ [DEVICE] Dispositivo ${fingerprintId} revogado`);
    } catch (error) {
      console.error("Error revoking device:", error);
    }
  }
}

// Singleton instance
let deviceFingerprintServiceInstance: DeviceFingerprintService | null = null;

export function getDeviceFingerprintService(): DeviceFingerprintService {
  if (!deviceFingerprintServiceInstance) {
    deviceFingerprintServiceInstance = new DeviceFingerprintService();
  }
  return deviceFingerprintServiceInstance;
}
