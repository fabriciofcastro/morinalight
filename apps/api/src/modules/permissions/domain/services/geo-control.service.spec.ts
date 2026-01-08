import { Test, type TestingModule } from "@nestjs/testing";
import { PrismaService } from "@/core/database/prisma.service";
import { GeoControlService } from "./geo-control.service";

describe("GeoControlService", () => {
  let service: GeoControlService;
  let prisma: PrismaService;

  const mockPrismaService = {
    geoRestriction: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    userGeoRestriction: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    roleGeoRestriction: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeoControlService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<GeoControlService>(GeoControlService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("isIpAllowed", () => {
    it("deve permitir IP na whitelist", async () => {
      const userId = "user-123";
      const ip = "192.168.1.100";

      mockPrismaService.userGeoRestriction.findMany.mockResolvedValue([
        {
          geoRestriction: {
            type: "IP_RANGE",
            action: "ALLOW",
            ipRanges: ["192.168.1.0/24"],
            isActive: true,
          },
        },
      ]);

      mockPrismaService.user.findUnique.mockResolvedValue({
        roles: [],
      });

      const result = await service.isIpAllowed(userId, ip);

      expect(result).toBe(true);
    });

    it("deve bloquear IP na blacklist", async () => {
      const userId = "user-123";
      const ip = "10.0.0.50";

      mockPrismaService.userGeoRestriction.findMany.mockResolvedValue([
        {
          geoRestriction: {
            type: "IP_RANGE",
            action: "DENY",
            ipRanges: ["10.0.0.0/8"],
            isActive: true,
          },
        },
      ]);

      mockPrismaService.user.findUnique.mockResolvedValue({
        roles: [],
      });

      const result = await service.isIpAllowed(userId, ip);

      expect(result).toBe(false);
    });

    it("deve permitir IP se não há restrições", async () => {
      const userId = "user-123";
      const ip = "192.168.1.100";

      mockPrismaService.userGeoRestriction.findMany.mockResolvedValue([]);
      mockPrismaService.user.findUnique.mockResolvedValue({
        roles: [],
      });

      const result = await service.isIpAllowed(userId, ip);

      expect(result).toBe(true);
    });
  });

  describe("isCountryAllowed", () => {
    it("deve permitir país na whitelist", async () => {
      const userId = "user-123";
      const country = "BR";

      mockPrismaService.userGeoRestriction.findMany.mockResolvedValue([
        {
          geoRestriction: {
            type: "COUNTRY",
            action: "ALLOW",
            countries: ["BR", "US"],
            isActive: true,
          },
        },
      ]);

      mockPrismaService.user.findUnique.mockResolvedValue({
        roles: [],
      });

      const result = await service.isCountryAllowed(userId, country);

      expect(result).toBe(true);
    });

    it("deve bloquear país na blacklist", async () => {
      const userId = "user-123";
      const country = "KP";

      mockPrismaService.userGeoRestriction.findMany.mockResolvedValue([
        {
          geoRestriction: {
            type: "COUNTRY",
            action: "DENY",
            countries: ["KP", "IR"],
            isActive: true,
          },
        },
      ]);

      mockPrismaService.user.findUnique.mockResolvedValue({
        roles: [],
      });

      const result = await service.isCountryAllowed(userId, country);

      expect(result).toBe(false);
    });
  });

  describe("validateAccess", () => {
    it("deve validar acesso completo com sucesso", async () => {
      const userId = "user-123";
      const ip = "192.168.1.100";

      mockPrismaService.userGeoRestriction.findMany.mockResolvedValue([
        {
          geoRestriction: {
            type: "IP_RANGE",
            action: "ALLOW",
            ipRanges: ["192.168.1.0/24"],
            countries: ["BR"],
            blockVpn: false,
            blockProxy: false,
            blockTor: false,
            isActive: true,
          },
        },
      ]);

      mockPrismaService.user.findUnique.mockResolvedValue({
        roles: [],
      });

      const result = await service.validateAccess(userId, ip);

      expect(result.allowed).toBe(true);
    });

    it("deve bloquear se VPN detectada e bloqueio ativo", async () => {
      const userId = "user-123";
      const ip = "192.168.1.100";

      mockPrismaService.userGeoRestriction.findMany.mockResolvedValue([
        {
          geoRestriction: {
            type: "IP_RANGE",
            action: "ALLOW",
            ipRanges: ["192.168.1.0/24"],
            countries: [],
            blockVpn: true,
            blockProxy: false,
            blockTor: false,
            isActive: true,
          },
        },
      ]);

      mockPrismaService.user.findUnique.mockResolvedValue({
        roles: [],
      });

      // Mock VPN detection
      jest.spyOn(service, "detectVpn").mockResolvedValue(true);

      const result = await service.validateAccess(userId, ip);

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("VPN");
    });
  });

  describe("createGeoRestriction", () => {
    it("deve criar restrição geográfica válida", async () => {
      const input = {
        orgId: "org-123",
        name: "Apenas Brasil",
        type: "COUNTRY" as const,
        action: "ALLOW" as const,
        countries: ["BR"],
        ipRanges: [],
        blockVpn: true,
        blockProxy: true,
        blockTor: true,
      };

      const mockRestriction = {
        id: "restriction-123",
        ...input,
        cities: [],
        states: [],
        priority: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.geoRestriction.create.mockResolvedValue(mockRestriction);

      const result = await service.createGeoRestriction(input);

      expect(result).toEqual(mockRestriction);
      expect(mockPrismaService.geoRestriction.create).toHaveBeenCalled();
    });
  });
});
