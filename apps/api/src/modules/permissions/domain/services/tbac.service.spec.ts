import { Test, type TestingModule } from "@nestjs/testing";
import { PrismaService } from "@/core/database/prisma.service";
import { TbacService } from "./tbac.service";

describe("TbacService", () => {
  let service: TbacService;
  let prisma: PrismaService;

  const mockPrismaService = {
    timeWindow: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    userTimeWindow: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    roleTimeWindow: {
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
        TbacService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TbacService>(TbacService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("isAccessAllowedNow", () => {
    it("deve permitir acesso dentro da janela de tempo", async () => {
      const userId = "user-123";
      const now = new Date("2024-01-15T10:00:00Z"); // Segunda-feira, 10h

      // Mock: janela de tempo 08:00-18:00, Seg-Sex
      mockPrismaService.userTimeWindow.findMany.mockResolvedValue([
        {
          timeWindow: {
            id: "window-1",
            startTime: "08:00",
            endTime: "18:00",
            daysOfWeek: [1, 2, 3, 4, 5],
            timezone: "UTC",
            active: true,
          },
        },
      ]);

      mockPrismaService.user.findUnique.mockResolvedValue({
        roles: [],
      });

      const result = await service.isAccessAllowedNow(userId, now);

      expect(result).toBe(true);
    });

    it("deve negar acesso fora da janela de tempo", async () => {
      const userId = "user-123";
      const now = new Date("2024-01-15T20:00:00Z"); // Segunda-feira, 20h (fora do horário)

      mockPrismaService.userTimeWindow.findMany.mockResolvedValue([
        {
          timeWindow: {
            id: "window-1",
            startTime: "08:00",
            endTime: "18:00",
            daysOfWeek: [1, 2, 3, 4, 5],
            timezone: "UTC",
            active: true,
          },
        },
      ]);

      mockPrismaService.user.findUnique.mockResolvedValue({
        roles: [],
      });

      const result = await service.isAccessAllowedNow(userId, now);

      expect(result).toBe(false);
    });

    it("deve negar acesso em dia não permitido", async () => {
      const userId = "user-123";
      const now = new Date("2024-01-14T10:00:00Z"); // Domingo, 10h

      mockPrismaService.userTimeWindow.findMany.mockResolvedValue([
        {
          timeWindow: {
            id: "window-1",
            startTime: "08:00",
            endTime: "18:00",
            daysOfWeek: [1, 2, 3, 4, 5], // Seg-Sex
            timezone: "UTC",
            active: true,
          },
        },
      ]);

      mockPrismaService.user.findUnique.mockResolvedValue({
        roles: [],
      });

      const result = await service.isAccessAllowedNow(userId, now);

      expect(result).toBe(false);
    });

    it("deve permitir acesso se não há janelas configuradas", async () => {
      const userId = "user-123";

      mockPrismaService.userTimeWindow.findMany.mockResolvedValue([]);
      mockPrismaService.user.findUnique.mockResolvedValue({
        roles: [],
      });

      const result = await service.isAccessAllowedNow(userId);

      expect(result).toBe(true);
    });
  });

  describe("createTimeWindow", () => {
    it("deve criar uma janela de tempo válida", async () => {
      const input = {
        orgId: "org-123",
        name: "Horário Comercial",
        startTime: "08:00",
        endTime: "18:00",
        daysOfWeek: [1, 2, 3, 4, 5],
        timezone: "America/Sao_Paulo",
      };

      const mockWindow = {
        id: "window-123",
        ...input,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.timeWindow.create.mockResolvedValue(mockWindow);

      const result = await service.createTimeWindow(input);

      expect(result).toEqual(mockWindow);
      expect(mockPrismaService.timeWindow.create).toHaveBeenCalledWith({
        data: input,
      });
    });
  });

  describe("createEmergencyAccess", () => {
    it("deve criar acesso emergencial temporário", async () => {
      const userId = "user-123";
      const orgId = "org-123";
      const durationMinutes = 60;

      const mockWindow = {
        id: "emergency-window-123",
        orgId,
        name: expect.stringContaining("Emergência"),
        active: true,
      };

      mockPrismaService.timeWindow.create.mockResolvedValue(mockWindow);
      mockPrismaService.userTimeWindow.create.mockResolvedValue({});

      const result = await service.createEmergencyAccess(userId, durationMinutes, orgId);

      expect(result).toEqual(mockWindow);
      expect(mockPrismaService.timeWindow.create).toHaveBeenCalled();
      expect(mockPrismaService.userTimeWindow.create).toHaveBeenCalled();
    });
  });

  describe("validateTimeWindow", () => {
    it("deve validar janela que cruza meia-noite", async () => {
      const window = {
        startTime: "22:00",
        endTime: "06:00",
        daysOfWeek: [1, 2, 3, 4, 5],
        timezone: "UTC",
      };

      const now = new Date("2024-01-15T23:00:00Z"); // Segunda, 23h

      const result = service["validateTimeWindow"](window as any, now);

      expect(result).toBe(true);
    });

    it("deve validar janela normal", async () => {
      const window = {
        startTime: "08:00",
        endTime: "18:00",
        daysOfWeek: [1, 2, 3, 4, 5],
        timezone: "UTC",
      };

      const now = new Date("2024-01-15T10:00:00Z"); // Segunda, 10h

      const result = service["validateTimeWindow"](window as any, now);

      expect(result).toBe(true);
    });
  });
});
