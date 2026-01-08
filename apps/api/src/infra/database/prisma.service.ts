import * as Prisma from "@prisma/client";
import * as Sentry from "@sentry/node";
import { env } from "../../core/config/env";
import { registerEncryptionMiddleware } from "../../core/database/encryption.middleware";
import { registerTenantFilterMiddleware } from "../../core/database/tenant-filter.middleware";
import { SecurityPrismaExtension } from "./security-prisma.extension";


// Export constant instance
let prisma: ExtendedPrismaClient | null = null;
let prismaRead: Prisma.PrismaClient | null = null;

export type ExtendedPrismaClient = ReturnType<typeof getPrisma>;

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
        // ... logs de erro
        throw new Error(
          "DATABASE_URL não configurada. Verifique se o arquivo .env existe na raiz do projeto e contém DATABASE_URL",
        );
      }
    }

    if (!databaseUrl) {
      throw new Error("DATABASE_URL not configured");
    }

    const baseClient = new Prisma.PrismaClient({
      log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
      datasources: { db: { url: databaseUrl } },
    });

    // Registrar middlewares LEGADOS do Prisma (antes de estender)
    if (env.NODE_ENV !== "test") {
      registerTenantFilterMiddleware(baseClient);
      registerEncryptionMiddleware(baseClient);
    }

    // Aplicar Extensões de Segurança e Monitoramento
    prisma = baseClient.$extends(SecurityPrismaExtension).$extends({
      name: "sentry-monitoring",

      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            const start = Date.now();
            try {
              const result = await query(args);
              const end = Date.now();
              const duration = end - start;

              // 1. Breadcrumbs para contexto (Queries >= 50ms)
              if (duration >= 50) {
                Sentry.addBreadcrumb({
                  category: "db",
                  message: `${model}.${operation}`,
                  data: {
                    duration_ms: duration,
                    model,
                    operation,
                    // args: JSON.stringify(args), // Cuidado com PII
                  },
                  level: "info",
                });
              }

              // 2. Alertas para Queries Lentas (Queries >= 500ms)
              if (duration >= 500) {
                Sentry.captureMessage(`Slow DB Query: ${model}.${operation} (${duration}ms)`, {
                  level: "warning",
                  tags: {
                    "db.slow_query": "true",
                    "db.model": model,
                    "db.operation": operation,
                  },
                  extra: {
                    duration_ms: duration,
                    args, // Args podem conter PII, scrubbing é feito no beforeSend
                  },
                });
              }

              return result;
            } catch (error) {
              // Erros já são capturados pelo Sentry globalmente,
              // mas podemos adicionar contexto extra aqui se necessário
              throw error;
            }
          },
        },
      },
    });
  }


  return prisma;
}

// Separate Prisma client for read operations (replica)
export function getPrismaRead() {
  if (!prismaRead) {
    const replicaUrl = process.env.DATABASE_REPLICA_URL || env.DATABASE_URL;
    if (!replicaUrl) throw new Error("REPLICA_URL not configured");

    const baseReplica = new Prisma.PrismaClient({
      datasources: { db: { url: replicaUrl } },
      log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });

    prismaRead = baseReplica.$extends(SecurityPrismaExtension);
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
