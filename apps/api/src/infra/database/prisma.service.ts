import * as Prisma from "@prisma/client";
import { env } from "../../core/config/env";
import { registerTenantFilterMiddleware } from "../../core/database/tenant-filter.middleware";
import { registerEncryptionMiddleware } from "../../core/database/encryption.middleware";

type PrismaClient = Prisma.PrismaClient;

let prisma: PrismaClient | null = null;

export function getPrisma() {
  if (!prisma) {
    // Verificar DATABASE_URL de múltiplas fontes
    const databaseUrl = env.DATABASE_URL || process.env.DATABASE_URL;

    // Log da DATABASE_URL (sem senha) para debug
    if (env.NODE_ENV === "development") {
      if (databaseUrl) {
        const maskedUrl = databaseUrl.replace(/:\/\/[^:]+:[^@]+@/, "://***:***@");
        console.log("🔵 [PRISMA] Conectando ao banco:", maskedUrl);
      } else {
        console.error("🔴 [PRISMA] DATABASE_URL não configurada!");
        console.error("   env.DATABASE_URL:", env.DATABASE_URL ? "✅" : "❌");
        console.error("   process.env.DATABASE_URL:", process.env.DATABASE_URL ? "✅" : "❌");
        console.error("   Verifique se o arquivo .env existe na raiz do projeto");
        throw new Error(
          "DATABASE_URL não configurada. Verifique se o arquivo .env existe na raiz do projeto e contém DATABASE_URL",
        );
      }
    }

    if (!databaseUrl) {
      throw new Error(
        "DATABASE_URL não configurada. Verifique se o arquivo .env existe na raiz do projeto e contém DATABASE_URL",
      );
    }

    const prismaOptions: Prisma.Prisma.PrismaClientOptions = {
      log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    };

    prisma = new Prisma.PrismaClient(prismaOptions);

    // Registrar middlewares do Prisma
    if (env.NODE_ENV !== "test") {
      // Middleware de filtro por tenant
      registerTenantFilterMiddleware(prisma);

      // Middleware de criptografia de campos sensíveis
      registerEncryptionMiddleware(prisma);
    }
  }

  return prisma;
}

// Separate Prisma client for read operations (replica)
let prismaRead: PrismaClient | null = null;

export function getPrismaRead() {
  if (!prismaRead) {
    const replicaUrl = process.env.DATABASE_REPLICA_URL || env.DATABASE_URL;

    prismaRead = new Prisma.PrismaClient({
      datasources: {
        db: {
          url: replicaUrl,
        },
      },
      log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  }

  return prismaRead;
}

// Cleanup function
export async function disconnectPrisma() {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
  if (prismaRead) {
    await prismaRead.$disconnect();
    prismaRead = null;
  }
}
